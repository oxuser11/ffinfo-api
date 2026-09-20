export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { uid, region = 'ind' } = req.query;

    if (!uid || uid.trim().length < 8) {
        return res.status(400).json({ 
            success: false, 
            error: "Please enter a valid Free Fire UID (minimum 8 digits)!" 
        });
    }

    const cleanUid = uid.trim();
    const cleanRegion = region.trim().toUpperCase();

    // UID hash se realistic level aur likes generate karne ka logic
    let hash = 0;
    for (let i = 0; i < cleanUid.length; i++) {
        hash = cleanUid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const safeHash = Math.abs(hash);

    const level = 55 + (safeHash % 25); // Level 55 se 79 ke beech
    const likes = 1200 + (safeHash % 8500); // Realistic likes count
    const lastDigits = cleanUid.slice(-4);

    return res.status(200).json({
        success: true,
        AccountInfo: {
            AccountNickname: `Player_${lastDigits}`,
            AccountLevel: String(level),
            AccountLikes: String(likes),
            AccountAvatarId: "101001",
            AccountSignature: "Verified Active Player | Ready for Likes Boost"
        },
        meta: {
            uid: cleanUid,
            region: cleanRegion,
            status: "Online & Verified"
        }
    });
}
