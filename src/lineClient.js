const axios = require('axios');

class LineClient {
  constructor(channelAccessToken) {
    this.baseURL = 'https://api.line.me/v2/bot';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
    };
  }

  // テキストメッセージを送信
  async sendTextMessage(userId, text) {
    try {
      const response = await axios.post(`${this.baseURL}/message/push`, {
        to: userId,
        messages: [
          {
            type: 'text',
            text: text
          }
        ]
      }, { headers: this.headers });
      console.log('✓ メッセージ送信成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('✗ メッセージ送信失敗:', error.response?.data || error.message);
      throw error;
    }
  }

  // 複数のテキストメッセージを一括送信
  async sendMultipleMessages(userId, messages) {
    try {
      const messageObjects = messages.map(text => ({
        type: 'text',
        text: text
      }));

      const response = await axios.post(`${this.baseURL}/message/push`, {
        to: userId,
        messages: messageObjects
      }, { headers: this.headers });
      console.log('✓ 複数メッセージ送信成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('✗ 複数メッセージ送信失敗:', error.response?.data || error.message);
      throw error;
    }
  }

  // ボタンテンプレートメッセージを送信
  async sendButtonMessage(userId, title, text, buttons) {
    try {
      const response = await axios.post(`${this.baseURL}/message/push`, {
        to: userId,
        messages: [
          {
            type: 'template',
            altText: title,
            template: {
              type: 'buttons',
              title: title,
              text: text,
              actions: buttons
            }
          }
        ]
      }, { headers: this.headers });
      console.log('✓ ボタンメッセージ送信成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('✗ ボタンメッセージ送信失敗:', error.response?.data || error.message);
      throw error;
    }
  }

  // 確認メッセージ（Confirm）を送信
  async sendConfirmMessage(userId, text, okLabel, cancelLabel) {
    try {
      const response = await axios.post(`${this.baseURL}/message/push`, {
        to: userId,
        messages: [
          {
            type: 'template',
            altText: '確認メッセージ',
            template: {
              type: 'confirm',
              text: text,
              actions: [
                {
                  type: 'message',
                  label: okLabel,
                  text: okLabel
                },
                {
                  type: 'message',
                  label: cancelLabel,
                  text: cancelLabel
                }
              ]
            }
          }
        ]
      }, { headers: this.headers });
      console.log('✓ 確認メッセージ送信成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('✗ 確認メッセージ送信失敗:', error.response?.data || error.message);
      throw error;
    }
  }

  // ユーザー情報を取得
  async getUserProfile(userId) {
    try {
      const response = await axios.get(`${this.baseURL}/profile/${userId}`, {
        headers: this.headers
      });
      console.log('✓ ユーザー情報取得成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('✗ ユーザー情報取得失敗:', error.response?.data || error.message);
      throw error;
    }
  }

  // リッチメニューを取得
  async getRichMenus() {
    try {
      const response = await axios.get(`${this.baseURL}/richmenu/list`, {
        headers: this.headers
      });
      console.log('✓ リッチメニュー取得成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('✗ リッチメニュー取得失敗:', error.response?.data || error.message);
      throw error;
    }
  }

  // メッセージイベントを処理
  processWebhookEvent(event) {
    const eventType = event.type;
    const userId = event.source.userId;

    switch (eventType) {
      case 'message':
        return {
          type: 'message',
          userId: userId,
          messageType: event.message.type,
          text: event.message.text || ''
        };
      case 'follow':
        return {
          type: 'follow',
          userId: userId
        };
      case 'unfollow':
        return {
          type: 'unfollow',
          userId: userId
        };
      case 'join':
        return {
          type: 'join',
          source: event.source.type
        };
      default:
        return {
          type: 'unknown',
          eventType: eventType
        };
    }
  }
}

module.exports = LineClient;
