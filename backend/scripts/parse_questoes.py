import os
import json
import openai
from dotenv import load_load

# Configure sua chave de API
# client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "SUA_CHAVE_AQUI"))
# Para usar, substitua SUA_CHAVE_AQUI ou defina variavel de ambiente

def parse_questao_medicina(texto_bruto, client):
    prompt_sistema = """
    Você é um assistente especializado em estruturar dados educacionais. 
    Sua tarefa é ler textos de questões de vestibular de medicina e transformá-los em JSON estrito.
    Siga este esquema:
    {
      "id": "BIO-001",
      "vestibular": "FUVEST",
      "ano": 2023,
      "materia": "Biologia",
      "assunto": "Genética",
      "sub-assunto": "Linkage",
      "dificuldade": "Difícil",
      "enunciado": "Texto ou link da imagem da questão...",
      "alternativas": {
        "a": "Descrição...",
        "b": "Descrição...",
        "c": "Descrição...",
        "d": "Descrição...",
        "e": "Descrição..."
      },
      "resposta_correta": "c",
      "resolucao_base": "Explicação técnica para a IA usar de referência",
      "tags_medicina": ["Alta Recorrência", "Segunda Fase"]
    }
    """
    
    response = client.chat.completions.create(
        model="gpt-4o", # Ou gpt-3.5-turbo / gpt-4o-mini
        messages=[
            {"role": "system", "content": prompt_sistema},
            {"role": "user", "content": f"Transforme esta questão em JSON:\n\n{texto_bruto}"}
        ],
        response_format={ "type": "json_object" } # Garante que o retorno seja JSON
    )
    
    return json.loads(response.choices[0].message.content)


if __name__ == "__main__":
    # Exemplo de uso
    texto_da_prova = """
    (UNICAMP 2024) A herança da cor dos olhos na espécie humana... 
    a) ... b) ... c) ... d) ... 
    Gabarito: C
    Resolução: A alternativa C está correta porque a cor dos olhos...
    """

    client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "SUA_CHAVE_AQUI"))
    
    try:
        questao_json = parse_questao_medicina(texto_da_prova, client)
        print(json.dumps(questao_json, indent=2, ensure_ascii=False))
        # Exemplo de Upload Futuro:
        # inserir_no_supabase(questao_json) ou psycopg2
    except Exception as e:
        print("Erro ao parsear questão. Verifique a chave de API:", e)
