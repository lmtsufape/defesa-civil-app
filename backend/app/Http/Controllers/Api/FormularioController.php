<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formulario;
use Illuminate\Http\Request;

class FormularioController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'localidade'                          => 'required|string|max:255',
            'setor'                               => 'nullable|string|max:255',
            'titular'                             => 'required|string|max:255',
            'endereco'                            => 'required|string|max:255',
            'numero'                              => 'nullable|string|max:20',

            'localizacao'                         => 'required',
            'causas_problemas'                    => 'nullable',

            'num_pavimentos'                      => 'nullable|integer',
            'area_aproximada'                     => 'nullable|numeric',
            'num_comodos'                         => 'nullable|integer',
            'num_dormitorios'                     => 'nullable|integer',
            'tempo_construcao_anos'               => 'nullable|integer',
            'piso'                                => 'nullable',
            'piso_especificacao'                  => 'nullable',
            'situacao_piso'                       => 'nullable',
            'estrutura'                           => 'nullable',
            'vedacao'                             => 'nullable',
            'vedacao_especificacao'               => 'nullable',
            'situacao_parede'                     => 'nullable',

            'revestimento_externo'                => 'nullable',
            'revestimento_externo_especificacao'  => 'nullable',
            'percentual_revestimento_interno'     => 'nullable',
            'revestimento_interno'                => 'nullable',
            'revestimento_interno_especificacao'  => 'nullable',
            'cobertura'                           => 'nullable',
            'cobertura_especificacao'             => 'nullable',

            'conservacao_cobertura'               => 'nullable',
            'conservacao_edificacao'              => 'nullable',
            'instalacao_eletrica'                 => 'nullable',
            'sanitario'                           => 'nullable',
            'sanitario_especificacao'             => 'nullable',

            'destino_esgoto_primario'             => 'nullable',
            'destino_esgoto_primario_especificacao'=> 'nullable',
            'destino_aguas_servidas'              => 'nullable',
            'destino_aguas_servidas_especificacao'=> 'nullable',
            'destino_lixo'                        => 'nullable',
            'destino_lixo_especificacao'          => 'nullable',

            'intervencao_parede'                  => 'nullable',
            'intervencao_coberta'                 => 'nullable',
            'indicacao_atuacao'                   => 'nullable',
            'indicacao_demolicao'                 => 'nullable',
            'intervencao_piso'                    => 'nullable',

            'observacoes'                         => 'nullable|string',

            'motivo_remocao'                      => 'nullable',
            'motivo_remocao_especificacao'        => 'nullable',
            'encaminhamentos'                     => 'nullable',

            'grau_risco'                          => 'nullable',

            'analista_tecnico'                    => 'nullable|string|max:255',
            'chefia_gerente'                      => 'nullable|string|max:255',
            'data_conclusao'                      => 'nullable|date',

            'preenchido_em'                       => 'nullable|date',
        ]);

        $validated['user_id'] = $request->user()->id;

        $formulario = Formulario::create($validated);

        return response()->json([
            'message'    => 'Formulário recebido e salvo com sucesso!',
            'formulario' => $formulario,
        ], 201);
    }

    public function index(Request $request)
    {
        $formularios = Formulario::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($formularios);
    }

    public function show(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json($formulario);
    }

    public function update(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'localidade'                          => 'sometimes|required|string|max:255',
            'setor'                               => 'nullable|string|max:255',
            'titular'                             => 'sometimes|required|string|max:255',
            'endereco'                            => 'sometimes|required|string|max:255',
            'numero'                              => 'nullable|string|max:20',

            'localizacao'                         => 'sometimes|required',
            'causas_problemas'                    => 'nullable',

            'num_pavimentos'                      => 'nullable|integer',
            'area_aproximada'                     => 'nullable|numeric',
            'num_comodos'                         => 'nullable|integer',
            'num_dormitorios'                     => 'nullable|integer',
            'tempo_construcao_anos'               => 'nullable|integer',
            'piso'                                => 'nullable',
            'piso_especificacao'                  => 'nullable',
            'situacao_piso'                       => 'nullable',
            'estrutura'                           => 'nullable',
            'vedacao'                             => 'nullable',
            'vedacao_especificacao'               => 'nullable',
            'situacao_parede'                     => 'nullable',

            'revestimento_externo'                => 'nullable',
            'revestimento_externo_especificacao'  => 'nullable',
            'percentual_revestimento_interno'     => 'nullable',
            'revestimento_interno'                => 'nullable',
            'revestimento_interno_especificacao'  => 'nullable',
            'cobertura'                           => 'nullable',
            'cobertura_especificacao'             => 'nullable',

            'conservacao_cobertura'               => 'nullable',
            'conservacao_edificacao'              => 'nullable',
            'instalacao_eletrica'                 => 'nullable',
            'sanitario'                           => 'nullable',
            'sanitario_especificacao'             => 'nullable',

            'destino_esgoto_primario'             => 'nullable',
            'destino_esgoto_primario_especificacao'=> 'nullable',
            'destino_aguas_servidas'              => 'nullable',
            'destino_aguas_servidas_especificacao'=> 'nullable',
            'destino_lixo'                        => 'nullable',
            'destino_lixo_especificacao'          => 'nullable',

            'intervencao_parede'                  => 'nullable',
            'intervencao_coberta'                 => 'nullable',
            'indicacao_atuacao'                   => 'nullable',
            'indicacao_demolicao'                 => 'nullable',
            'intervencao_piso'                    => 'nullable',

            'observacoes'                         => 'nullable|string',

            'motivo_remocao'                      => 'nullable',
            'motivo_remocao_especificacao'        => 'nullable',
            'encaminhamentos'                     => 'nullable',

            'grau_risco'                          => 'nullable',

            'analista_tecnico'                    => 'nullable|string|max:255',
            'chefia_gerente'                      => 'nullable|string|max:255',
            'data_conclusao'                      => 'nullable|date',

            'preenchido_em'                       => 'nullable|date',
        ]);

        $formulario->update($validated);

        return response()->json([
            'message'    => 'Formulário atualizado com sucesso!',
            'formulario' => $formulario,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $formulario->delete();

        return response()->json([
            'message' => 'Formulário excluído com sucesso!'
        ]);
    }
}
