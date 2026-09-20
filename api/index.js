export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { uid, region = 'ind' } = req.query;

    if (!uid) {
        return res.status(400).json({ success: false, error: "UID required" });
    }

    // Direct endpoints list
    const sources = [
        `https://ff-api-gamma.vercel.app/api?uid=${uid}&region=${region}`,
        `https://freefire-virusteam.vercel.app/info?uid=${uid}&region=${region}`
    ];

    for (const url of sources) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4500);

            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const acc = data.AccountInfo || data.basicInfo || data.account_info || data;
                const nickname = acc.AccountNickname || acc.nickname || acc.AccountName;

                if (nickname) {
                    return res.status(200).json({
                        success: true,
                        AccountInfo: {
                            AccountNickname: nickname,
                            AccountLevel: acc.AccountLevel || acc.level || "1",
                            AccountLikes: acc.AccountLikes || acc.likes || "0",
                            AccountAvatarId: acc.AccountAvatarId || acc.headPic || "101001"
                        }
                    });
                }
            }
        } catch (e) {
            // Next source check
            continue;
        }
    }

    return res.status(404).json({
        success: false,
        error: "Player UID not found!"
    });
}
