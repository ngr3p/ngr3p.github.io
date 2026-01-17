import os
import json
import re
import datetime
import subprocess

# --- CONFIGURAÇÕES ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTENT_DIR = os.path.join(BASE_DIR, 'content')
ARTICLES_DIR = os.path.join(CONTENT_DIR, 'articles')
JSON_PATH = os.path.join(CONTENT_DIR, 'posts.json')

def slugify(text):
    """Transforma 'Meu Título Épico' em 'meu-titulo-epico'."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text) # Remove caracteres especiais
    text = re.sub(r'[\s_-]+', '-', text) # Troca espaços por hifens
    return text.strip('-')

def load_posts():
    if not os.path.exists(JSON_PATH):
        return []
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_posts(posts):
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=4, ensure_ascii=False)
    print("💾 Banco de dados (JSON) atualizado.")

def create_post():
    print("\n--- 📝 NOVO POST ---")
    title = input("Título do Post: ").strip()
    if not title:
        print("❌ Título inválido.")
        return

    category = input("Categoria (ex: #RedTeam): ").strip() or "#General"
    
    # Gerar Slug e Data
    slug = slugify(title)
    date_now = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # Nome do arquivo de conteúdo
    filename = f"{slug}.html"
    filepath = os.path.join(ARTICLES_DIR, filename)

    # Criar o arquivo HTML limpo (só o recheio)
    html_template = f"""<h2>Introduction</h2>
<p>Escreva sua introdução aqui...</p>

<h3>Step 1: Reconnaissance</h3>
<p>Detalhes técnicos...</p>

<div class="terminal-block">
    <pre><code>sudo nmap -sC -sV target</code></pre>
</div>
"""
    
    if not os.path.exists(ARTICLES_DIR):
        os.makedirs(ARTICLES_DIR)

    if os.path.exists(filepath):
        print("⚠️  Aviso: Um arquivo com esse nome já existe. Não vou sobrescrever.")
        return

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_template)
    print(f"✅ Arquivo de conteúdo criado: content/articles/{filename}")

    # Atualizar o JSON
    posts = load_posts()
    
    # Criar novo ID (pega o maior ID existente + 1)
    new_id = 1
    if posts:
        new_id = max(p.get('id', 0) for p in posts) + 1

    new_post = {
        "id": new_id,
        "title": title,
        "date": datetime.datetime.now().strftime("%B %d, %Y"), # Formato bonito: January 15, 2026
        "category": category,
        "image": "assets/images/posts/hero.png", # Imagem padrão (depois você troca)
        "status": "post", # ou 'hero'
        "content_file": filename,
        "slug": slug, # Importante para a pasta
        "url": f"{slug}/" # Importante para o link
    }

    # Adiciona no começo da lista (para aparecer primeiro na Home)
    posts.insert(0, new_post)
    save_posts(posts)

    print("\n✨ Post criado com sucesso!")
    print(f"👉 Agora edite o arquivo: content/articles/{filename}")

def run_build():
    print("\n🔨 Iniciando Build...")
    subprocess.run(["python", "builder.py"])

def main_menu():
    while True:
        print("\n=== 💀 ngr3p MANAGER ===")
        print("1. Criar Novo Post")
        print("2. Rodar Build (Gerar Site)")
        print("3. Subir Servidor de Teste (Porta 8000)")
        print("0. Sair")
        
        choice = input("\nEscolha: ")
        
        if choice == '1':
            create_post()
        elif choice == '2':
            run_build()
        elif choice == '3':
            print("🌐 Servidor rodando em http://localhost:8000 (Ctrl+C para parar)")
            os.chdir('dist') # Entra na pasta dist
            subprocess.run(["python3", "-m", "http.server", "8000"])
            os.chdir('..') # Volta se o servidor parar
        elif choice == '0':
            print("Bye!")
            break
        else:
            print("Opção inválida.")

if __name__ == "__main__":
    main_menu()