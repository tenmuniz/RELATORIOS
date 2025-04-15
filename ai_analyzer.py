"""
Módulo para análise de texto usando OpenAI GPT-3.5 Turbo
"""
import os
import json
import logging
from openai import OpenAI

# Configurar o cliente OpenAI
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    logging.error("OPENAI_API_KEY environment variable is not set")
    
client = OpenAI(api_key=api_key)

def analyze_police_report(report_text):
    """
    Analisa um relatório policial usando OpenAI GPT.
    
    Args:
        report_text (str): Texto do relatório policial
        
    Returns:
        dict: Resultado da análise com contagens e informações extraídas
    """
    try:
        # Definir o prompt para a análise
        system_prompt = """
        Você é um assistente especializado em analisar relatórios policiais da 20ª CIPM no Brasil.
        Extraia as seguintes informações do relatório:
        1. Local (MUANÁ ou PONTA DE PEDRAS)
        2. Data (formato DD/MM/AAAA)
        3. Turno (Diurno ou Noturno)
        4. Contagens:
           - Pessoas a pé abordadas (número)
           - Motocicletas abordadas (número)
           - Carros abordados (número)
           - Bicicletas abordadas (número)
           - Prisões realizadas (número, incluindo apresentações em delegacia)
           - Motocicletas apreendidas (número)
           - Drogas apreendidas (quantidade em gramas, APENAS se explicitamente mencionado no texto)
           - Foragidos capturados (número, também conta como prisão)
           - Armas brancas apreendidas (número, inclui facas, facões, estiletes)
           - Armas de fogo apreendidas (número, inclui revólveres, pistolas, espingardas)
        5. Resumo da ocorrência (texto curto)
        
        IMPORTANTE: 
        - Se houver menção a levar alguém à delegacia, conduzir à delegacia, ou "apresentação", conte como uma prisão.
        - Se houver menção a "foragido" ou "evadido", conte como captura de foragido APENAS se ficar claro que a pessoa foi capturada.
        - "Armas brancas" inclui facas, facões, canivetes, estiletes e objetos cortantes usados como arma.
        - "Armas de fogo" inclui revólveres, pistolas, espingardas, rifles e similares.
        - Para drogas apreendidas, SOMENTE registre se houver EXPLÍCITA menção às palavras "droga", "entorpecente", "maconha", 
          "cocaína", "crack", ou outras substâncias ilícitas. Procure no texto menções claras como "x gramas de maconha", "apreensão de entorpecentes".
        - NÃO registre drogas se não houver menção clara e explícita a substâncias ilícitas no texto.
        - Se não houver qualquer menção a drogas ou entorpecentes, o valor deve ser ZERO.
        - Leia o contexto para entender se realmente houve prisão/apreensão.
        
        Responda APENAS em formato JSON, seguindo exatamente esta estrutura:
        {
          "location": "string",
          "date": "string",
          "shift": "string",
          "people_count": int,
          "motorcycles_count": int,
          "cars_count": int,
          "bicycles_count": int,
          "arrests_count": int,
          "seized_motorcycles_count": int,
          "drugs_seized_count": float,
          "fugitives_count": int,
          "bladed_weapons_count": int,
          "firearms_count": int,
          "occurrence": "string"
        }
        """
        
        # Chamada para a API da OpenAI
        # Usando o modelo GPT-3.5 Turbo conforme solicitado pelo usuário
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": report_text}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        # Extrair e retornar os resultados
        result = json.loads(response.choices[0].message.content)
        logging.info(f"AI Analysis Result: {result}")
        return result
        
    except Exception as e:
        logging.error(f"Error in AI analysis: {str(e)}")
        # Em caso de erro, retornar um resultado vazio com valores padrão
        return {
            "location": "NÃO IDENTIFICADO",
            "date": "",
            "shift": "Não identificado",
            "people_count": 0,
            "motorcycles_count": 0,
            "cars_count": 0,
            "bicycles_count": 0,
            "arrests_count": 0,
            "seized_motorcycles_count": 0,
            "drugs_seized_count": 0,
            "fugitives_count": 0,
            "bladed_weapons_count": 0,
            "firearms_count": 0,
            "occurrence": "Erro na análise de IA: " + str(e)
        }