// Same floating-price formula as the original ExchangePanel, with server-owned inputs.
export function floatingPrice({currentUsd,baseUsd,baseCentsPerGold,amplifier,realRateToday,realRateYesterday}) {
    if (![currentUsd,baseUsd,baseCentsPerGold,amplifier,realRateToday,realRateYesterday].every(n=>Number.isFinite(n)&&n>0)) throw new Error('Invalid pricing inputs');
    const raw=currentUsd/baseUsd, change=realRateToday/realRateYesterday;
    const rate=Math.max(0.001,raw*(1+(change-1)*amplifier)*baseCentsPerGold/100);
    const yesterday=raw*(1+(change-1)*amplifier*(realRateYesterday/realRateToday))*baseCentsPerGold/100;
    const rateMicros=Math.round(rate*1e6);
    if (!Number.isSafeInteger(rateMicros)||rateMicros<1000||rateMicros>1e9) throw new Error('Invalid market price');
    return {rateMicros,dailyChange:rate-yesterday,dailyChangePercent:yesterday>0?((rate-yesterday)/yesterday*100).toFixed(1):'0.0'};
}
