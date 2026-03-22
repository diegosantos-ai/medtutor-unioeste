import re

with open('components/TutorChat.tsx', 'r') as f:
    content = f.read()

replacement = """
      let errorMessage = "Desculpe, uma pequena falha no meu motor. Podemos tentar novamente?";
      if (error instanceof Error) {
        if (error.message.includes('NETWORK_OFFLINE')) {
          errorMessage = "Aviso: Ops! Aparentemente estamos sem conexão de rede. Verifique seu WiFi ou dados móveis e tente novamente.";
        } else if (error.message.includes('Maximum retries')) {
          errorMessage = "Aviso: Nossos servidores ou a IA estão enfrentando lentidão após várias tentativas. Respire, beba uma água e tente mandar novamente.";
        } else {
          errorMessage = `Aviso: Tive um deslize ao processar (${error.message.substring(0, 40)}...). Pode mandar de novo?`;
        }
      }

      setMessages(prev => [...prev, { role: 'bot', text: errorMessage, timestamp: Date.now() }]);
"""

content = re.sub(
    r"setMessages\(prev => \[\.\.\.prev, { role: 'bot', text: \"Desculpe, tive um erro ao processar\. Tente novamente\.\", timestamp: Date\.now\(\) \}\]\);",
    replacement.strip(),
    content
)

with open('components/TutorChat.tsx', 'w') as f:
    f.write(content)
