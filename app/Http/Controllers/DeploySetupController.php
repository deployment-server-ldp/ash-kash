<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

/**
 * One-time, no-terminal-needed production setup for hosts without SSH access
 * (e.g. Hostinger shared hosting). Visit /deploy-setup/{token} once after
 * uploading the app and filling in .env — it runs key:generate, migrate,
 * storage:link and the seeders, then locks itself so it can't run again.
 *
 * IMPORTANT: set DEPLOY_SETUP_TOKEN in your .env to a long random secret
 * before uploading, and delete this file (or the token from .env) once
 * setup is done.
 */
class DeploySetupController extends Controller
{
    protected function markerPath(): string
    {
        return storage_path('app/.deploy_setup_complete');
    }

    public function run(string $token)
    {
        $expected = config('shop.deploy_setup_token');

        if (blank($expected) || ! hash_equals($expected, $token)) {
            abort(403, 'Invalid or missing setup token.');
        }

        if (File::exists($this->markerPath())) {
            return $this->render('Setup already ran', 'This installer has already completed. Delete '.$this->markerPath().' to run it again (not recommended on a live site).', []);
        }

        $log = [];

        try {
            if (blank(config('app.key'))) {
                Artisan::call('key:generate', ['--force' => true]);
                $log[] = 'Generated APP_KEY.';
            } else {
                $log[] = 'APP_KEY already set — skipped.';
            }

            Artisan::call('migrate', ['--force' => true]);
            $log[] = 'Ran database migrations.';
            $log[] = trim(Artisan::output());

            Artisan::call('storage:link');
            $log[] = 'Linked public/storage.';

            Artisan::call('db:seed', ['--force' => true]);
            $log[] = 'Seeded roles, currencies, shipping, categories, demo products, homepage content, and the admin account.';

            Artisan::call('optimize:clear');
            $log[] = 'Cleared caches.';

            File::put($this->markerPath(), now()->toDateTimeString());

            return $this->render('Setup complete', 'Your store is live.', $log, true);
        } catch (\Throwable $e) {
            $log[] = 'ERROR: '.$e->getMessage();

            return $this->render('Setup failed', 'Something went wrong — check the log below, fix it (usually a .env database setting), then reload this page to retry.', $log);
        }
    }

    protected function render(string $title, string $message, array $log, bool $success = false)
    {
        $logHtml = collect($log)->map(fn ($line) => '<div>'.e($line).'</div>')->implode('');
        $color = $success ? '#2f5c4c' : '#8a6a3d';

        return response("
            <!DOCTYPE html>
            <html><head><meta charset='utf-8'><title>{$title}</title>
            <style>
                body { font-family: -apple-system, Arial, sans-serif; background:#faf7f2; color:#1b1815; padding:40px; max-width:700px; margin:0 auto; }
                h1 { color: {$color}; }
                .log { background:#fff; border:1px solid #e4cd9b; padding:16px; font-family:monospace; font-size:13px; white-space:pre-wrap; margin-top:20px; }
                a.btn { display:inline-block; margin-top:24px; background:#1b1815; color:#faf7f2; padding:12px 24px; text-decoration:none; }
            </style></head><body>
            <h1>{$title}</h1>
            <p>{$message}</p>
            <div class='log'>{$logHtml}</div>
            <a class='btn' href='/'>Visit your store</a>
            ".($success ? " <a class='btn' href='/admin' style='background:#a8834f'>Open admin panel</a>" : '')."
            <p style='margin-top:30px;color:#8a7f70;font-size:13px;'>For security, delete this route (app/Http/Controllers/DeploySetupController.php + the route in routes/web.php) or remove DEPLOY_SETUP_TOKEN from .env once you're done.</p>
            </body></html>
        ");
    }
}
