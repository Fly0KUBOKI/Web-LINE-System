import os
import hmac
import hashlib
import json
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from line_client import LineClient
from data_analyzer import DataAnalyzer

load_dotenv()

app = Flask(__name__)
client = LineClient(os.getenv("LINE_CHANNEL_ACCESS_TOKEN"))
analyzer = DataAnalyzer()

WEBHOOK_SECRET = os.getenv("LINE_WEBHOOK_SECRET")

def validate_signature(body: str, signature: str) -> bool:
    """Webhook署名を検証"""
    hash_obj = hmac.new(
        WEBHOOK_SECRET.encode(),
        body.encode(),
        hashlib.sha256
    )
    expected_signature = hash_obj.digest()
    expected_signature_b64 = __import__('base64').b64encode(expected_signature).decode()
    return expected_signature_b64 == signature

@app.route("/webhook", methods=["POST"])
def webhook():
    """Webhookエンドポイント"""
    body = request.get_data(as_text=True)
    signature = request.headers.get("X-Line-Signature")

    if not validate_signature(body, signature):
        print("[NG] 無効な署名です")
        return "Unauthorized", 401

    try:
        events = json.loads(body).get("events", [])

        for event in events:
            print(f"\n[EVENT] イベント受信: {event.get('type')}")

            if event.get("type") == "message" and event.get("message", {}).get("type") == "text":
                user_id = event.get("source", {}).get("userId")
                user_message = event.get("message", {}).get("text")

                print(f"ユーザー: {user_id}")
                print(f"メッセージ: {user_message}")

                analyzer.record_message(user_id, user_message)

                # 自動返信
                reply_message = f'"{user_message}"というメッセージをありがとうございます！'
                client.send_text_message(user_id, reply_message)

                # キーワード処理
                if "統計" in user_message or "分析" in user_message:
                    summary = analyzer.get_summary()
                    stats_text = f"""[STATS] 統計情報:
総メッセージ数: {summary['total_messages']}
ユーザー数: {summary['unique_users']}
総文字数: {summary['total_length']}"""
                    client.send_text_message(user_id, stats_text)

                if "ヘルプ" in user_message or "help" in user_message:
                    help_message = """[HELP] 利用可能なコマンド:
- "統計" または "分析" : メッセージ統計を表示
- "リセット" : データをリセット
- その他のテキスト : エコーバック"""
                    client.send_text_message(user_id, help_message)

                if "リセット" in user_message:
                    analyzer.reset()
                    client.send_text_message(user_id, "[OK] データをリセットしました")

            elif event.get("type") == "follow":
                user_id = event.get("source", {}).get("userId")
                print(f"ユーザーがフォローしました: {user_id}")
                client.send_text_message(
                    user_id,
                    "ようこそ！このボットはLINE Messaging APIのテストプログラムです。"
                )

            elif event.get("type") == "unfollow":
                print("ユーザーがフォロー解除しました")

            elif event.get("type") == "join":
                print("グループに参加しました")

        return jsonify({"status": "ok"}), 200

    except Exception as e:
        print(f"[ERROR] エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/health", methods=["GET"])
def health():
    """ヘルスチェックエンドポイント"""
    from datetime import datetime
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route("/stats", methods=["GET"])
def stats():
    """統計情報エンドポイント"""
    return jsonify(analyzer.get_summary()), 200

if __name__ == "__main__":
    PORT = int(os.getenv("PORT", 3000))
    print("=" * 50)
    print("[START] LINE Webhook サーバーが起動しました")
    print(f"   ポート: {PORT}")
    print(f"   Webhookエンドポイント: http://localhost:{PORT}/webhook")
    print(f"   統計情報: http://localhost:{PORT}/stats")
    print("=" * 50)
    app.run(host="0.0.0.0", port=PORT, debug=True)
