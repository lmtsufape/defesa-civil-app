<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('formularios', function (Blueprint $table) {
            if (!Schema::hasColumn('formularios', 'percentual_revestimento_externo')) {
                $table->json('percentual_revestimento_externo')->nullable()->after('revestimento_externo_especificacao');
            }
        });

        // Garantir que localizacao seja nullable no banco
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE formularios ALTER COLUMN localizacao DROP NOT NULL;');
    }

    public function down(): void
    {
        Schema::table('formularios', function (Blueprint $table) {
            $table->dropColumn('percentual_revestimento_externo');
        });
    }
};
