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
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();

            $table->enum('address_type', ['Home', 'Work', 'Custom', 'Others']);
            $table->text('custom_address_type')->nullable();
            $table->text('address_line_1');
            $table->text('address_line_2')->nullable();
            $table->text('province');
            $table->text('city');
            $table->text('state');
            $table->text('country');
            $table->text('pincode');

            // Adding foreign key to users table
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
