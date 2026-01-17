import os
import json
import shutil
from jinja2 import Environment, FileSystemLoader

# --- CONFIGURAÇÕES DA ARQUITETURA ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTENT_DIR = os.path.join(BASE_DIR, 'content')
TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')
OUTPUT_DIR = os.path.join(BASE_DIR, 'dist') # Pasta final do site

def clean_build_dir():
    """Limpa a pasta de destino para garantir um build fresco."""
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)
    print(f"✅ Pasta '{OUTPUT_DIR}' limpa e recriada.")

def copy_assets():
    """Copia a pasta static inteira para dentro do dist."""
    # Como você tem static/assets, ao copiar static para dist, 
    # teremos dist/assets. Perfeito.
    shutil.copytree(STATIC_DIR, OUTPUT_DIR, dirs_exist_ok=True)
    
    # Truque do Arquiteto: O JS busca o JSON em /assets/data/posts.json
    # Vamos garantir que o arquivo JSON vá para lá também.
    json_dest = os.path.join(OUTPUT_DIR, 'assets', 'data')
    os.makedirs(json_dest, exist_ok=True)
    shutil.copy(os.path.join(CONTENT_DIR, 'posts.json'), os.path.join(json_dest, 'posts.json'))
    print("✅ Assets e Dados copiados.")

def build_site():
    print("🚀 Iniciando Protocolo de Construção ngr3p...")
    
    # 1. Preparar Jinja2 (Engine de Templates)
    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
    
    # 2. Carregar Dados
    with open(os.path.join(CONTENT_DIR, 'posts.json'), 'r', encoding='utf-8') as f:
        posts = json.load(f)

    # 3. CONSTRUIR HOME (index.html)
    template_index = env.get_template('index.html')
    # Na home, os assets estão na mesma pasta, então o caminho é 'assets'
    html_home = template_index.render(posts=posts, asset_path="assets")
    
    with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html_home)
    print("✅ Home Page gerada.")

    # 4. CONSTRUIR POSTS (Páginas Internas)
    template_post = env.get_template('post.html')
    
    for post in posts:
        # Só gera página se tiver slug (se for status 'hero' ou 'post')
        slug = post.get('slug')
        if not slug:
            continue

        # Caminho: dist/nome-do-post/
        post_folder = os.path.join(OUTPUT_DIR, slug)
        os.makedirs(post_folder, exist_ok=True)

        # Ler o conteúdo HTML do arquivo separado
        content_file = post.get('content_file')
        body_content = ""
        
        if content_file:
            path_to_article = os.path.join(CONTENT_DIR, 'articles', content_file)
            if os.path.exists(path_to_article):
                with open(path_to_article, 'r', encoding='utf-8') as f:
                    body_content = f.read()
            else:
                body_content = "<p>[Sistema] Erro: Arquivo de conteúdo não encontrado.</p>"
        
        # --- PATCH DE CORREÇÃO AUTOMÁTICA DE CAMINHOS ---
        # Troca 'assets/' por '../assets/' para funcionar na subpasta
        if body_content:
            body_content = body_content.replace('src="assets/', 'src="../assets/')
            body_content = body_content.replace('href="assets/', 'href="../assets/')
        
        # Renderizar
        # TRUQUE: asset_path="../assets" porque descemos um nível na pasta
        html_post = template_post.render(
            post=post, 
            body_content=body_content, 
            asset_path="../assets"
        )

        with open(os.path.join(post_folder, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(html_post)
        print(f"   └── Post gerado: {slug}")

    print("\n🎉 Build concluído com sucesso!")
    print(f"👉 Site pronto em: {OUTPUT_DIR}")

if __name__ == "__main__":
    clean_build_dir()
    copy_assets()
    build_site()