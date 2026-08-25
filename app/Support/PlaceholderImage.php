<?php

namespace App\Support;

/**
 * Generates simple on-brand placeholder product photography for seed data,
 * since no external image CDN is wired up in this dev environment.
 * Swap real product photos in via the admin panel at any time.
 */
class PlaceholderImage
{
    protected const PALETTE = [
        [230, 219, 200], // sand
        [214, 197, 168], // taupe
        [196, 175, 140], // camel
        [225, 210, 195], // blush stone
        [201, 188, 170], // warm grey
        [211, 195, 178], // beige
    ];

    public static function make(string $label, int $seed = 0, int $width = 900, int $height = 1125): string
    {
        $color = self::PALETTE[$seed % count(self::PALETTE)];

        $image = imagecreatetruecolor($width, $height);
        $bg = imagecolorallocate($image, ...$color);
        imagefill($image, 0, 0, $bg);

        // Subtle darker frame for a boutique editorial feel.
        $frame = imagecolorallocate($image, max(0, $color[0] - 25), max(0, $color[1] - 25), max(0, $color[2] - 25));
        imagerectangle($image, 20, 20, $width - 20, $height - 20, $frame);

        $textColor = imagecolorallocate($image, 60, 52, 42);
        $font = 5;
        $lines = self::wrap($label, 18);
        $lineHeight = imagefontheight($font) + 10;
        $startY = ($height / 2) - (count($lines) * $lineHeight / 2);

        foreach ($lines as $i => $line) {
            $textWidth = imagefontwidth($font) * strlen($line);
            $x = ($width - $textWidth) / 2;
            imagestring($image, $font, (int) $x, (int) ($startY + $i * $lineHeight), $line, $textColor);
        }

        $path = tempnam(sys_get_temp_dir(), 'ph_').'.jpg';
        imagejpeg($image, $path, 85);
        imagedestroy($image);

        return $path;
    }

    protected static function wrap(string $text, int $maxLen): array
    {
        $words = explode(' ', $text);
        $lines = [];
        $current = '';

        foreach ($words as $word) {
            if (strlen($current.' '.$word) > $maxLen) {
                $lines[] = trim($current);
                $current = $word;
            } else {
                $current .= ' '.$word;
            }
        }
        $lines[] = trim($current);

        return array_filter($lines);
    }
}
