from datetime import datetime
from typing import List, Dict, Optional
import json

class DataAnalyzer:
    def __init__(self):
        self.message_history = []
        self.user_stats = {}

    def record_message(self, user_id: str, text: str, timestamp: Optional[datetime] = None):
        """メッセージを記録"""
        if timestamp is None:
            timestamp = datetime.now()

        self.message_history.append({
            "user_id": user_id,
            "text": text,
            "timestamp": timestamp.isoformat(),
            "length": len(text)
        })

        if user_id not in self.user_stats:
            self.user_stats[user_id] = {
                "message_count": 0,
                "total_length": 0,
                "first_message": timestamp.isoformat(),
                "last_message": timestamp.isoformat()
            }

        self.user_stats[user_id]["message_count"] += 1
        self.user_stats[user_id]["total_length"] += len(text)
        self.user_stats[user_id]["last_message"] = timestamp.isoformat()

    def get_user_stats(self, user_id: str) -> Optional[Dict]:
        """ユーザー別の統計を取得"""
        return self.user_stats.get(user_id)

    def get_all_stats(self) -> List[Dict]:
        """全ユーザーの統計を取得"""
        stats_list = []
        for user_id, stats in self.user_stats.items():
            avg_length = stats["total_length"] / stats["message_count"] if stats["message_count"] > 0 else 0
            stats_list.append({
                "user_id": user_id,
                "message_count": stats["message_count"],
                "total_length": stats["total_length"],
                "first_message": stats["first_message"],
                "last_message": stats["last_message"],
                "average_message_length": round(avg_length, 2)
            })
        return stats_list

    def search_messages(self, keyword: str) -> List[Dict]:
        """キーワードでメッセージを検索"""
        return [
            msg for msg in self.message_history
            if keyword.lower() in msg["text"].lower()
        ]

    def get_message_count_by_hour(self) -> Dict[int, int]:
        """時間帯別のメッセージ集計"""
        hour_counts = {}
        for msg in self.message_history:
            dt = datetime.fromisoformat(msg["timestamp"])
            hour = dt.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        return hour_counts

    def get_summary(self) -> Dict:
        """メッセージ統計サマリー"""
        total_messages = len(self.message_history)
        unique_users = len(self.user_stats)
        total_length = sum(msg["length"] for msg in self.message_history)
        avg_length = total_length / total_messages if total_messages > 0 else 0

        return {
            "total_messages": total_messages,
            "unique_users": unique_users,
            "total_length": total_length,
            "average_length": round(avg_length, 2),
            "user_stats": self.get_all_stats()
        }

    def export_to_json(self) -> Dict:
        """データをJSONでエクスポート"""
        return {
            "summary": self.get_summary(),
            "history": self.message_history,
            "user_stats": self.user_stats
        }

    def reset(self):
        """データを初期化"""
        self.message_history = []
        self.user_stats = {}
