<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJurnalSesisTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('jurnal_sesis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                  ->constrained('gurus');
            $table->foreignId('kelas_id')
                  ->constrained('kelas');
            $table->foreignId('mata_pelajaran_id')
                  ->constrained('mata_pelajarans');
            $table->date('tanggal');
            $table->string('sesi', 10); // Misal: "1-2" atau "3-4"
            $table->string('topik_pembelajaran');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('jurnal_sesis');
    }
}
