import { CartItem } from "@/types";

const WHATSAPP_NUMBER = "01044220707"; // ← غيّر الرقم لرقم الواتساب بتاع المحل

export function generateWhatsAppMessage(items: CartItem[], total: number): string {
    const header = "🛒 *طلب جديد من كيلو لب*\n━━━━━━━━━━━━━━━━━\n\n";

    const itemLines = items
        .map(
            (item, index) =>
                `${index + 1}. *${item.product.name}* (${item.selectedWeight})\n   ${item.quantity} × ${item.product.price} ج.م = ${item.quantity * item.product.price} ج.م`
        )
        .join("\n\n");

    const footer = `\n\n━━━━━━━━━━━━━━━━━\n💰 *الإجمالي: ${total} ج.م*\n\nبرجاء تأكيد الطلب ووقت التوصيل. شكراً! 🙏`;

    return header + itemLines + footer;
}

export function openWhatsApp(items: CartItem[], total: number): void {
    const message = generateWhatsAppMessage(items, total);
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, "_blank");
}