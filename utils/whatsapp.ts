import { CartItem } from "@/types";
import { getItemPrice } from "@/utils/weightPrice";

const WHATSAPP_NUMBER = "201044220707"; // Egypt country code (20) + number without leading zero

export function generateWhatsAppMessage(items: CartItem[], total: number): string {
    const header = "🛒 *طلب جديد من كيلو لب*\n━━━━━━━━━━━━━━━━━\n\n";

    const itemLines = items
        .map(
            (item, index) => {
                const unitPrice = getItemPrice(item.product.price, item.selectedWeight);
                const lineTotal = unitPrice * item.quantity;
                return `${index + 1}. *${item.product.name}* (${item.selectedWeight})\n   ${item.quantity} × ${unitPrice} ج.م = ${lineTotal} ج.م`;
            }
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