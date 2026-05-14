import requests
import json
from typing import List, Dict, Optional

class LineClient:
    def __init__(self, channel_access_token: str):
        self.base_url = "https://api.line.me/v2/bot"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {channel_access_token}"
        }

    def send_text_message(self, user_id: str, text: str) -> Dict:
        """テキストメッセージを送信"""
        try:
            response = requests.post(
                f"{self.base_url}/message/push",
                headers=self.headers,
                json={
                    "to": user_id,
                    "messages": [
                        {
                            "type": "text",
                            "text": text
                        }
                    ]
                }
            )
            response.raise_for_status()
            print(f"[OK] メッセージ送信成功: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[NG] メッセージ送信失敗: {e}")
            if hasattr(e.response, 'text'):
                print(f"詳細: {e.response.text}")
            raise

    def send_multiple_messages(self, user_id: str, messages: List[str]) -> Dict:
        """複数のテキストメッセージを一括送信"""
        try:
            message_objects = [
                {"type": "text", "text": text}
                for text in messages
            ]
            response = requests.post(
                f"{self.base_url}/message/push",
                headers=self.headers,
                json={
                    "to": user_id,
                    "messages": message_objects
                }
            )
            response.raise_for_status()
            print(f"[OK] 複数メッセージ送信成功: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[NG] 複数メッセージ送信失敗: {e}")
            raise

    def send_button_message(self, user_id: str, title: str, text: str, buttons: List[Dict]) -> Dict:
        """ボタンテンプレートメッセージを送信"""
        try:
            response = requests.post(
                f"{self.base_url}/message/push",
                headers=self.headers,
                json={
                    "to": user_id,
                    "messages": [
                        {
                            "type": "template",
                            "altText": title,
                            "template": {
                                "type": "buttons",
                                "title": title,
                                "text": text,
                                "actions": buttons
                            }
                        }
                    ]
                }
            )
            response.raise_for_status()
            print(f"[OK] ボタンメッセージ送信成功: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[NG] ボタンメッセージ送信失敗: {e}")
            raise

    def send_confirm_message(self, user_id: str, text: str, ok_label: str, cancel_label: str) -> Dict:
        """確認メッセージを送信"""
        try:
            response = requests.post(
                f"{self.base_url}/message/push",
                headers=self.headers,
                json={
                    "to": user_id,
                    "messages": [
                        {
                            "type": "template",
                            "altText": "確認メッセージ",
                            "template": {
                                "type": "confirm",
                                "text": text,
                                "actions": [
                                    {
                                        "type": "message",
                                        "label": ok_label,
                                        "text": ok_label
                                    },
                                    {
                                        "type": "message",
                                        "label": cancel_label,
                                        "text": cancel_label
                                    }
                                ]
                            }
                        }
                    ]
                }
            )
            response.raise_for_status()
            print(f"[OK] 確認メッセージ送信成功: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[NG] 確認メッセージ送信失敗: {e}")
            raise

    def get_user_profile(self, user_id: str) -> Dict:
        """ユーザー情報を取得"""
        try:
            response = requests.get(
                f"{self.base_url}/profile/{user_id}",
                headers=self.headers
            )
            response.raise_for_status()
            print(f"[OK] ユーザー情報取得成功: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[NG] ユーザー情報取得失敗: {e}")
            raise

    def get_rich_menus(self) -> Dict:
        """リッチメニュー一覧を取得"""
        try:
            response = requests.get(
                f"{self.base_url}/richmenu/list",
                headers=self.headers
            )
            response.raise_for_status()
            print(f"[OK] リッチメニュー取得成功: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[NG] リッチメニュー取得失敗: {e}")
            raise

    def process_webhook_event(self, event: Dict) -> Dict:
        """Webhookイベントを処理"""
        event_type = event.get("type")
        user_id = event.get("source", {}).get("userId")

        if event_type == "message":
            return {
                "type": "message",
                "user_id": user_id,
                "message_type": event.get("message", {}).get("type"),
                "text": event.get("message", {}).get("text", "")
            }
        elif event_type == "follow":
            return {"type": "follow", "user_id": user_id}
        elif event_type == "unfollow":
            return {"type": "unfollow", "user_id": user_id}
        elif event_type == "join":
            return {"type": "join", "source": event.get("source", {}).get("type")}
        else:
            return {"type": "unknown", "event_type": event_type}
