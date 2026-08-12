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
        Schema::create('agreeds_months', function (Blueprint $table) {
            $table->id();
            $table->string('month');
            $table->string('year');
            $table->string('number_of_jobs');
            $table->integer('project_id');
            $table->string('created_by')->nullable();
            $table->timestamps();
        });

        Schema::create('agreeds_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_name');
            $table->string('date_received');
            $table->string('job_status');
            $table->string('month');
            $table->string('year');
            $table->integer('project_id');
            $table->string('created_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agreeds');
    }
};
