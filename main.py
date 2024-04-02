from flask import Flask, request, send_file, jsonify
import subprocess

app = Flask(__name__)

@app.route('/v', methods=['GET'])
def download_video():
    # GETリクエストから動画のURLを取得
    video_url = request.args.get('url')

    if video_url:
        # yt-dlpを使用して動画をダウンロード
        result = subprocess.run(['yt-dlp', '-f', 'best', '-o', '%(title)s.%(ext)s', video_url], capture_output=True, text=True)

        # ダウンロードが成功したかどうかをチェック
        if result.returncode == 0:
            # ダウンロードされた動画ファイルをブラウザに提供する
            return send_file(f'{result.stdout.strip()}', as_attachment=True)
        else:
            return jsonify({'error': '動画のダウンロードに失敗しました'}), 500
    else:
        return jsonify({'error': '動画のURLが提供されていません'}), 400

@app.route('/a', methods=['GET'])
def download_audio():
    # GETリクエストから動画のURLを取得
    video_url = request.args.get('url')

    if video_url:
        # yt-dlpを使用して音楽をダウンロード
        result = subprocess.run(['yt-dlp', '--extract-audio', '--audio-format', 'mp3', '-o', '%(title)s.%(ext)s', video_url], capture_output=True, text=True)

        # ダウンロードが成功したかどうかをチェック
        if result.returncode == 0:
            # ダウンロードされた音楽ファイルをブラウザに提供する
            return send_file(f'{result.stdout.strip()}', as_attachment=True)
        else:
            return jsonify({'error': '音楽のダウンロードに失敗しました'}), 500
    else:
        return jsonify({'error': '動画のURLが提供されていません'}), 400

if __name__ == '__main__':
    app.run(debug=True)

