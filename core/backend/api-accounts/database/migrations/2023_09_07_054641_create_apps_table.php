<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('apps', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('version');
            $table->enum('type', ['development', 'production']);
            $table->enum('category', ['learning', 'finance', 'reports', 'accounts']);
            $table->string('host');
            $table->integer('port')->nullable();
            $table->string('last_updated');
            $table->timestamps();
        });

        Schema::create('apps_to_companies', function (Blueprint $table) {
            $table->id();

            // Adding foreign key to users table
            $table->unsignedBigInteger('company_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');

            // Adding foreign key to users table
            $table->unsignedBigInteger('app_id');
            $table->foreign('app_id')->references('id')->on('apps')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apps');
    }
};
