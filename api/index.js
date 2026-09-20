export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { uid, region = 'ind' } = req.query;

    if (!uid) {
        return res.status(400).json({ success: false, error: "UID required" });
    }

    try {
        const target = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://ff-api-gamma.vercel.app/api?uid=${uid}&region=${region}`)}`;
        const response = await fetch(target, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }
        });

        const data = await response.json();
        const acc = data.AccountInfo || data.basicInfo || data;
        const nickname = acc.AccountNickname || acc.nickname;

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
        } else {
            return res.status(404).json({ success: false, error: "UID not found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: "Upstream gateway error" });
    }
}
