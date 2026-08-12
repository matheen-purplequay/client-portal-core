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

        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('short_name', 100);
            $table->string('dashboards')->nullable();
            $table->string('company_logo')->nullable();
            $table->unsignedBigInteger('parent_company_id')->nullable();
            $table->unsignedBigInteger('works_manager_client_id')->nullable();
            $table->string('primary_contact_first_name', 50);
            $table->string('primary_contact_last_name', 50)->nullable();
            $table->string('primary_contact_email', 100)->nullable();
            $table->string('primary_contact_phone', 20)->nullable();
            $table->string('secondary_contact_first_name', 50)->nullable();
            $table->string('secondary_contact_last_name', 50)->nullable();
            $table->string('secondary_contact_email', 100)->nullable();
            $table->string('secondary_contact_phone', 20)->nullable();
            $table->enum('industry_type', [
                'Technology',
                'Finance',
                'Healthcare',
                'Retail',
                'Manufacturing',
                'Education',
                'Entertainment',
                'Hospitality',
                'Real Estate',
                'Transportation',
                'Energy',
                'Agriculture',
                'Other'
            ]);
            $table->enum('client_type', [
                'self',
                'client',
                'sub_client',
                'vendor'
            ]);

            // Adding foreign key to users table
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->timestamps();
        });

        Schema::create('user_details', function (Blueprint $table) {
            $table->id();
            $table->text('remarks');
            $table->date('date_of_birth');
            $table->string('role');
            $table->enum('status', ['active', 'inactive', 'hold', 'dormant']);

            // Adding foreign key to user_details table
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('company_id');

            $table->timestamps();
        });

        Schema::table('user_details', function($table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_details');
        Schema::dropIfExists('companies');
    }
};
