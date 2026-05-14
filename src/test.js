require('dotenv').config();
const LineClient = require('./lineClient');
const DataAnalyzer = require('./dataAnalyzer');

const client = new LineClient(process.env.LINE_CHANNEL_ACCESS_TOKEN);
const analyzer = new DataAnalyzer();

async function runTests() {
  const userId = process.env.USER_ID;

  if (!userId) {
    console.error('エラー: .envファイルにUSER_IDを設定してください');
    return;
  }

  console.log('='.repeat(50));
  console.log('LINE Messaging API テストプログラム');
  console.log('='.repeat(50));

  try {
    // 1. ユーザー情報の取得
    console.log('\n[テスト1] ユーザー情報の取得');
    console.log('-'.repeat(50));
    const userProfile = await client.getUserProfile(userId);
    console.log('ユーザー名:', userProfile.displayName);
    console.log('ステータス:', userProfile.statusMessage);

    // 2. シンプルなメッセージ送信
    console.log('\n[テスト2] シンプルなメッセージ送信');
    console.log('-'.repeat(50));
    await client.sendTextMessage(userId, 'こんにちは！LINE API テストです。');
    analyzer.recordMessage(userId, 'こんにちは！LINE API テストです。');

    // 3. 複数メッセージの送信
    console.log('\n[テスト3] 複数メッセージの送信');
    console.log('-'.repeat(50));
    const messages = [
      '📊 これはテストメッセージ1です',
      '🎯 これはテストメッセージ2です',
      '✅ これはテストメッセージ3です'
    ];
    await client.sendMultipleMessages(userId, messages);
    messages.forEach(msg => analyzer.recordMessage(userId, msg));

    // 4. ボタンメッセージの送信
    console.log('\n[テスト4] ボタンメッセージの送信');
    console.log('-'.repeat(50));
    const buttons = [
      {
        type: 'postback',
        label: 'はい',
        data: 'action=yes&user_id=U37cbb8df484561fb3666066d719d4672'
      },
      {
        type: 'postback',
        label: 'いいえ',
        data: 'action=no&user_id=U37cbb8df484561fb3666066d719d4672'
      }
    ];
    await client.sendButtonMessage(
      userId,
      'テストアンケート',
      'このテストは成功していますか?',
      buttons
    );

    // 5. 確認メッセージの送信
    console.log('\n[テスト5] 確認メッセージの送信');
    console.log('-'.repeat(50));
    await client.sendConfirmMessage(
      userId,
      'データベースに保存してもよろしいですか?',
      '保存',
      'キャンセル'
    );

    // 6. データ分析結果の表示
    console.log('\n[テスト6] データ分析結果');
    console.log('-'.repeat(50));
    const summary = analyzer.getSummary();
    console.log('📊 分析結果:');
    console.log(`  総メッセージ数: ${summary.totalMessages}`);
    console.log(`  ユニークユーザー数: ${summary.uniqueUsers}`);
    console.log(`  総文字数: ${summary.totalLength}`);
    console.log(`  平均メッセージ長: ${summary.averageLength}`);

    console.log('\n📈 ユーザー別統計:');
    summary.userStats.forEach(stat => {
      console.log(`  ユーザーID: ${stat.userId.substring(0, 10)}...`);
      console.log(`    メッセージ数: ${stat.messageCount}`);
      console.log(`    総文字数: ${stat.totalLength}`);
      console.log(`    平均文字数: ${stat.averageMessageLength}`);
    });

    // 7. リッチメニュー情報の取得
    console.log('\n[テスト7] リッチメニュー情報の取得');
    console.log('-'.repeat(50));
    const richMenus = await client.getRichMenus();
    if (richMenus.richmenus && richMenus.richmenus.length > 0) {
      console.log(`取得されたリッチメニュー数: ${richMenus.richmenus.length}`);
    } else {
      console.log('設定されているリッチメニューはありません');
    }

    // 8. 最終的な確認メッセージ
    console.log('\n[テスト8] 完了通知');
    console.log('-'.repeat(50));
    await client.sendTextMessage(
      userId,
      '✅ すべてのテストが完了しました!'
    );

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.error('詳細:', error.response?.data || error.stack);
  }

  console.log('\n' + '='.repeat(50));
  console.log('テスト完了');
  console.log('='.repeat(50));
}

// テスト実行
runTests();
