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
        Schema::create('connect_reports', function (Blueprint $table) {
            $table->id();
            $table->string('client_id');
            $table->string('name');
            $table->string('pages');
            $table->string('month');
            $table->string('year');
            $table->string('client_director');
            $table->string('team_lead');
            $table->string('file');
            $table->timestamps();
        });

        Schema::create('weekly_reports', function (Blueprint $table) {
            $table->id();
            $table->string('client_id');
            $table->string('name');
            $table->string('pages');
            $table->string('month');
            $table->string('year');
            $table->string('client_director');
            $table->string('team_lead');
            $table->string('file');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
