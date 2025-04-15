"""
Módulo para análise de texto usando OpenAI GPT-4o
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
           - Drogas apreendidas (0 ou 1, se houve apreensão)
           - Foragidos capturados (número, também conta como prisão)
        5. Resumo da ocorrência (texto curto)
        
        IMPORTANTE: 
        - Se houver menção a levar alguém à delegacia, conduzir à delegacia, ou "apresentação", conte como uma prisão.
        - Se houver menção a "foragido" ou "evadido", conte como captura de foragido.
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
          "drugs_seized_count": int,
          "fugitives_count": int,
          "occurrence": "string"
        }
        """
        
        # Chamada para a API da OpenAI
        # o modelo mais recente OpenAI é "gpt-4o" que foi lançado em 13 de maio de 2024.
        # não altere isso a menos que seja explicitamente solicitado pelo usuário
        response = client.chat.completions.create(
            model="gpt-4o",
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
            "occurrence": "Erro na análise de IA: " + str(e)
        }