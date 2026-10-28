<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Formulario extends Model
{
    protected $fillable = [
        'user_id',

        'localidade',
        'setor',
        'titular',
        'endereco',
        'numero',

        'localizacao',
        'causas_problemas',

        'num_pavimentos',
        'area_aproximada',
        'num_comodos',
        'num_dormitorios',
        'tempo_construcao_anos',
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

        'observacoes',

        'motivo_remocao',
        'motivo_remocao_especificacao',
        'encaminhamentos',

        'grau_risco',

        'analista_tecnico',
        'chefia_gerente',
        'data_conclusao',

        'preenchido_em',
    ];

    protected $casts = [
        'localizacao' => 'array',
        'causas_problemas' => 'array',
        'piso' => 'array',
        'piso_especificacao' => 'array',
        'situacao_piso' => 'array',
        'estrutura' => 'array',
        'vedacao' => 'array',
        'vedacao_especificacao' => 'array',
        'situacao_parede' => 'array',
        'revestimento_externo' => 'array',
        'revestimento_externo_especificacao' => 'array',
        'percentual_revestimento_interno' => 'array',
        'revestimento_interno' => 'array',
        'revestimento_interno_especificacao' => 'array',
        'cobertura' => 'array',
        'cobertura_especificacao' => 'array',
        'conservacao_cobertura' => 'array',
        'conservacao_edificacao' => 'array',
        'instalacao_eletrica' => 'array',
        'sanitario' => 'array',
        'sanitario_especificacao' => 'array',
        'destino_esgoto_primario' => 'array',
        'destino_esgoto_primario_especificacao' => 'array',
        'destino_aguas_servidas' => 'array',
        'destino_aguas_servidas_especificacao' => 'array',
        'destino_lixo' => 'array',
        'destino_lixo_especificacao' => 'array',
        'intervencao_parede' => 'array',
        'intervencao_coberta' => 'array',
        'indicacao_atuacao' => 'array',
        'indicacao_demolicao' => 'array',
        'intervencao_piso' => 'array',
        'motivo_remocao' => 'array',
        'motivo_remocao_especificacao' => 'array',
        'encaminhamentos' => 'array',
        'grau_risco' => 'array',
        'preenchido_em' => 'datetime',
        'data_conclusao' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
