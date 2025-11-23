# Menggunakan image yang sudah siap pakai untuk Laravel (Nginx + PHP)
FROM richarvey/nginx-php-fpm:3.1.6

# Copy semua file project ke dalam container
COPY . .

# Image ini butuh environment variable ini untuk build
ENV SKIP_COMPOSER 0
ENV ERRORS 0
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1

# Setting agar Laravel bisa berjalan lancar
ENV APP_ENV production
ENV APP_DEBUG false
ENV LOG_CHANNEL stderr

# Allow Composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER 1

# Install dependency
RUN composer install --no-dev --optimize-autoloader

# Ubah permission agar storage bisa ditulisi
RUN chmod -R 777 storage bootstrap/cache