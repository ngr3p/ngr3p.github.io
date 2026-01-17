import os
import json
import shutil
import sys
from jinja2 import Environment, FileSystemLoader

# --- CONFIGURACOES DA ARQUITETURA ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTENT_DIR = os.path.join(BASE_DIR, 'content')
TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')
OUTPUT_DIR = os.path.join(BASE_DIR, 'dist')

def clean_build_dir():
    """Limpa a pasta de destino para garantir um build fresco."""
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)
    print(f"[OK] Cleaned build directory: {OUTPUT_DIR}")

def copy_assets():
    """Copia a pasta static de forma inteligente e posiciona o JSON."""
    
    # 1. LOGICA ANTI-DUPLICIDADE
    # Verifica se dentro de 'static' JÁ EXISTE uma pasta 'assets'
    if os.path.exists(os.path.join(STATIC_DIR, 'assets')):
        # Se ja tem 'assets' na origem (static/assets/css), copiamos para a raiz da dist
        # Resultado final: dist/assets/css
        shutil.copytree(STATIC_DIR, OUTPUT_DIR, dirs_exist_ok=True)
    else:
        # Se os arquivos estao soltos (static/css), criamos a pasta assets na dist
        # Resultado final: dist/assets/css
        shutil.copytree(STATIC_DIR, os.path.join(OUTPUT_DIR, 'assets'), dirs_exist_ok=True)
    
    # 2. POSICIONAMENTO DO JSON (CRITICO PARA O JS)
    # O arquivo precisa estar em: dist/assets/data/posts.json
    final_data_path = os.path.join(OUTPUT_DIR, 'assets', 'data')
    os.makedirs(final_data_path, exist_ok=True)
    
    shutil.copy(os.path.join(CONTENT_DIR, 'posts.json'), os.path.join(final_data_path, 'posts.json'))
    
    # 3. LIMPEZA DEFENSIVA
    # Se por acaso uma pasta 'data' foi copiada para a raiz errada, removemos
    wrong_data_path = os.path.join(OUTPUT_DIR, 'data')
    if os.path.exists(wrong_data_path):
        shutil.rmtree(wrong_data_path)
    
    print("[OK] Assets fixed & JSON placed at 'dist/assets/data'.")

def build_site():
    print("[>] Starting ngr3p Build System...")
    
    # 1. Preparar Jinja2
    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
    
    # 2. Carregar Dados
    try:
        with open(os.path.join(CONTENT_DIR, 'posts.json'), 'r', encoding='utf-8') as f:
            posts = json.load(f)
    except FileNotFoundError:
        print("[!] Error: posts.json not found.")
        return

    # 3. CONSTRUIR HOME (index.html)
    template_index = env.get_template('index.html')
    # Na home, asset_path eh simples
    html_home = template_index.render(posts=posts, asset_path="assets")
    
    with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html_home)
    print("[OK] Home Page generated.")

    # 4. CONSTRUIR POSTS (Paginas Internas)
    template_post = env.get_template('post.html')
    
    count = 0
    for post in posts:
        slug = post.get('slug')
        if not slug: continue

        post_folder = os.path.join(OUTPUT_DIR, slug)
        os.makedirs(post_folder, exist_ok=True)

        content_file = post.get('content_file')
        body_content = ""
        
        if content_file:
            path_to_article = os.path.join(CONTENT_DIR, 'articles', content_file)
            if os.path.exists(path_to_article):
                with open(path_to_article, 'r', encoding='utf-8') as f:
                    body_content = f.read()
            else:
                body_content = "<p>[System] Error: Content file not found.</p>"
        
        # Patch de caminhos para subpasta (assets/ -> ../assets/)
        if body_content:
            body_content = body_content.replace('src="assets/', 'src="../assets/')
            body_content = body_content.replace('href="assets/', 'href="../assets/')
        
        # Renderiza injetando a lista completa de posts (para o grid do rodape)
        html_post = template_post.render(
            post=post, 
            posts=posts, 
            body_content=body_content, 
            asset_path="../assets" # Caminho relativo para voltar um nivel
        )

        with open(os.path.join(post_folder, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(html_post)
        
        print(f"   [+] Generated: {slug}")
        count += 1

    print(f"\n[DONE] Build finished. {count} posts generated.")
    print(f"      Target: {OUTPUT_DIR}")

if __name__ == "__main__":
    try:
        clean_build_dir()
        copy_assets()
        build_site()
    except KeyboardInterrupt:
        print("\n[!] Build aborted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n[!] Critical Error: {e}")
        sys.exit(1)