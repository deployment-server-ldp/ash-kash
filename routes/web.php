<?php

use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Account\AuthController;
use App\Http\Controllers\Admin\OrderPrintController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

Route::get('/shop', [ShopController::class, 'index'])->name('shop.index');
Route::get('/category/{category:slug}', [ShopController::class, 'category'])->name('shop.category');
Route::get('/collection/{collection:slug}', [ShopController::class, 'collection'])->name('shop.collection');
Route::get('/product/{product:slug}', [ProductController::class, 'show'])->name('shop.product');
Route::post('/product/{product}/reviews', [ReviewController::class, 'store'])->name('reviews.store');

Route::get('/search', [SearchController::class, 'index'])->name('search');

Route::get('/cart', [CartController::class, 'index'])->name('cart.index');

Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/confirmation/{order:order_number}', [CheckoutController::class, 'confirmation'])->name('checkout.confirmation');

Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');

Route::post('/currency/switch', [CurrencyController::class, 'switch'])->name('currency.switch');

Route::post('/newsletter/subscribe', [HomeController::class, 'newsletter'])->name('newsletter.subscribe');

Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{blogPost:slug}', [BlogController::class, 'show'])->name('blog.show');

Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::post('/contact', [PageController::class, 'submitContact'])->name('contact.submit');
Route::get('/pages/{page:slug}', [PageController::class, 'show'])->name('pages.show');

// Customer account (guard: customer)
Route::prefix('account')->name('account.')->group(function () {
    Route::middleware('guest.customer')->group(function () {
        Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AuthController::class, 'login']);
        Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
        Route::post('/register', [AuthController::class, 'register']);
    });

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::middleware('customer')->group(function () {
        Route::get('/', [AccountController::class, 'dashboard'])->name('dashboard');
        Route::get('/orders', [AccountController::class, 'orders'])->name('orders');
        Route::get('/orders/{order:order_number}', [AccountController::class, 'orderShow'])->name('orders.show');
        Route::get('/addresses', [AccountController::class, 'addresses'])->name('addresses');
        Route::post('/addresses', [AccountController::class, 'storeAddress'])->name('addresses.store');
        Route::delete('/addresses/{address}', [AccountController::class, 'destroyAddress'])->name('addresses.destroy');
        Route::get('/profile', [AccountController::class, 'profile'])->name('profile');
        Route::put('/profile', [AccountController::class, 'updateProfile'])->name('profile.update');
    });
});

// Printable admin documents (protected by the admin `web` guard)
Route::middleware('auth')->prefix('admin-print')->name('admin.orders.')->group(function () {
    Route::get('/orders/{order}/invoice', [OrderPrintController::class, 'invoice'])->name('invoice');
    Route::get('/orders/{order}/packing-slip', [OrderPrintController::class, 'packingSlip'])->name('packing-slip');
});
