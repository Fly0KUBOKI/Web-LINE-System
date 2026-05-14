import os
from dotenv import load_dotenv
from line_client import LineClient
from data_analyzer import DataAnalyzer

load_dotenv()

client = LineClient(os.getenv("LINE_CHANNEL_ACCESS_TOKEN"))
analyzer = DataAnalyzer()

def run_tests():
    user_id = os.getenv("USER_ID")

    if not user_id:
        print("エラー: .envファイルにUSER_IDを設定してください")
        return

    print("=" * 50)
    print("LINE Messaging API テストプログラム")
    print("=" * 50)

    try:
        # テスト1: ユーザー情報の取得
        print("\n[テスト1] ユーザー情報の取得")
        print("-" * 50)
        user_profile = client.get_user_profile(user_id)
        print(f"ユーザー名: {user_profile.get('displayName')}")
        print(f"ステータス: {user_profile.get('statusMessage')}")

        # テスト2: シンプルなメッセージ送信
        print("\n[テスト2] シンプルなメッセージ送信")
        print("-" * 50)
        client.send_text_message(user_id, "こんにちは！LINE API テストです。")
        analyzer.record_message(user_id, "こんにちは！LINE API テストです。")

        # テスト3: 複数メッセージの送信
        print("\n[テスト3] 複数メッセージの送信")
        print("-" * 50)
        messages = [
            "[1] これはテストメッセージ1です",
            "[2] これはテストメッセージ2です",
            "[3] これはテストメッセージ3です"
        ]
        client.send_multiple_messages(user_id, messages)
        for msg in messages:
            analyzer.record_message(user_id, msg)

        # テスト4: ボタンメッセージの送信
        print("\n[テスト4] ボタンメッセージの送信")
        print("-" * 50)
        buttons = [
            {"type": "message", "label": "はい", "text": "はい"},
            {"type": "message", "label": "いいえ", "text": "いいえ"}
        ]
        client.send_button_message(
            user_id,
            "テストアンケート",
            "このテストは成功していますか?",
            buttons
        )

        # テスト5: 確認メッセージの送信
        print("\n[テスト5] 確認メッセージの送信")
        print("-" * 50)
        client.send_confirm_message(
            user_id,
            "データベースに保存してもよろしいですか?",
            "保存",
            "キャンセル"
        )

        # テスト6: データ分析結果の表示
        print("\n[テスト6] データ分析結果")
        print("-" * 50)
        summary = analyzer.get_summary()
        print("[STATS] 分析結果:")
        print(f"  総メッセージ数: {summary['total_messages']}")
        print(f"  ユニークユーザー数: {summary['unique_users']}")
        print(f"  総文字数: {summary['total_length']}")
        print(f"  平均メッセージ長: {summary['average_length']}")

        print("\n[STATS] ユーザー別統計:")
        for stat in summary['user_stats']:
            print(f"  ユーザーID: {stat['user_id'][:10]}...")
            print(f"    メッセージ数: {stat['message_count']}")
            print(f"    総文字数: {stat['total_length']}")
            print(f"    平均文字数: {stat['average_message_length']}")

        # テスト7: リッチメニュー情報の取得
        print("\n[テスト7] リッチメニュー情報の取得")
        print("-" * 50)
        rich_menus = client.get_rich_menus()
        if rich_menus.get("richmenus"):
            print(f"取得されたリッチメニュー数: {len(rich_menus['richmenus'])}")
        else:
            print("設定されているリッチメニューはありません")

        # テスト8: 完了通知
        print("\n[テスト8] 完了通知")
        print("-" * 50)
        client.send_text_message(user_id, "[OK] すべてのテストが完了しました!")

    except Exception as e:
        print(f"\n[ERROR] エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()

    print("\n" + "=" * 50)
    print("テスト完了")
    print("=" * 50)

if __name__ == "__main__":
    run_tests()
