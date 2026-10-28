<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $columns = [
        'localizacao',
        'piso',
        'piso_especificacao',
        'situacao_piso',
        'estrutura',
        'vedacao',
        'vedacao_especificacao',
        'situacao_parede',
        'revestimento_externo',
        'revestimento_externo_especificacao',
        'percentual_revestimento_interno',
        'revestimento_interno',
        'revestimento_interno_especificacao',
        'cobertura',
        'cobertura_especificacao',
        'conservacao_cobertura',
        'conservacao_edificacao',
        'instalacao_eletrica',
        'sanitario',
        'sanitario_especificacao',
        'destino_esgoto_primario',
        'destino_esgoto_primario_especificacao',
        'destino_aguas_servidas',
        'destino_aguas_servidas_especificacao',
        'destino_lixo',
        'destino_lixo_especificacao',
        'intervencao_parede',
        'intervencao_coberta',
        'indicacao_atuacao',
        'indicacao_demolicao',
        'intervencao_piso',
        'motivo_remocao',
        'motivo_remocao_especificacao',
        'encaminhamentos',
        'grau_risco',
    ];

    public function up(): void
    {
        foreach ($this->columns as $column) {
            DB::statement("ALTER TABLE formularios ALTER COLUMN {$column} TYPE json USING to_json({$column}::text)");
        }
    }

    public function down(): void
    {
        foreach ($this->columns as $column) {
            DB::statement("ALTER TABLE formularios ALTER COLUMN {$column} TYPE varchar(255) USING {$column}::text");
        }
    }
};
