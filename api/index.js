export default async function handler(req, res) {
    // CORS headers allow karne ke liye
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { uid, region = 'ind' } = req.query;

    if (!uid || uid.trim().length < 7) {
        return res.status(400).json({ 
            success: false, 
            error: "Valid UID required (minimum 7-8 digits)" 
        });
    }

    const cleanUid = uid.trim();
    const cleanRegion = region.trim().toLowerCase();

    // Redundant live profile gateways
    const endpoints = [
        `https://freefire-virusteam.vercel.app/info?uid=${cleanUid}&region=${cleanRegion}`,
        `https://ff-api-gamma.vercel.app/api?uid=${cleanUid}&region=${cleanRegion}`,
        `https://fast-ff-api.vercel.app/api/player?uid=${cleanUid}&region=${cleanRegion}`
    ];

    for (const url of endpoints) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36",
                    "Accept": "application/json"
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                
                // Server data normalize parsing
                const basic = data.AccountInfo || data.basicInfo || data.account_info || data.basic || data;
                const social = data.socialInfo || data.captainBasicInfo || data.profileInfo || {};

                const nickname = basic.AccountNickname || basic.nickname || basic.AccountName || basic.name;

                if (nickname) {
                    return res.status(200).json({
                        success: true,
                        AccountInfo: {
                            AccountNickname: nickname,
                            AccountLevel: String(basic.AccountLevel || basic.level || "1"),
                            AccountLikes: String(basic.AccountLikes || basic.likes || basic.liked || "0"),
                            AccountAvatarId: String(basic.AccountAvatarId || basic.headPic || basic.avatar_id || "101001"),
                            AccountSignature: social.Signature || basic.signature || basic.bio || social.bio || "No bio set"
                        }
                    });
                }
            }
        } catch (e) {
            // Agar pehla source fail ya timeout ho, agla source try hoga
            continue;
        }
    }

    return res.status(404).json({
        success: false,
        error: "Player UID not found or upstream servers busy. Please try again!"
    });
}
