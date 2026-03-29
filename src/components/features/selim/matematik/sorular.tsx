"use client";

import { Frac, Mixed, Times as T } from "./Frac";
import type { Soru } from "./types";

export const sorular: Soru[] = [
  {
    konu: "Kare Çevresi",
    seviye: "Normal",
    ikon: "📏",
    soru: (
      <>
        Bir kenarı <strong>4 cm</strong> olan karenin çevresi kaç
        cm&apos;dir?
      </>
    ),
    soruAlt: (
      <>
        Çevre = 4 <T /> kenar
      </>
    ),
    secenekler: ["12 cm", "16 cm", "20 cm", "8 cm"],
    dogruCevap: 1,
    ipuclari: [
      "Karenin 4 kenarı birbirine eşittir.",
      <>
        4 <T /> 4 = ?
      </>,
      <>
        4 <T /> 4 = <strong>16 cm</strong>
      </>,
    ],
  },
  {
    konu: "Kare Çevresi",
    seviye: "Zor",
    ikon: "📏",
    soru: (
      <>
        Bir karenin çevresi <strong>52 cm</strong> ise, bir kenarı kaç
        cm&apos;dir?
      </>
    ),
    soruAlt: <>Kenar = Çevre ÷ 4</>,
    secenekler: ["11 cm", "13 cm", "14 cm", "16 cm"],
    dogruCevap: 1,
    ipuclari: [
      "Çevre = 4 × kenar → kenarı bulmak için çevreyi 4'e böl.",
      "52 ÷ 4 = ?",
      <>
        52 ÷ 4 = <strong>13 cm</strong>
      </>,
    ],
  },
  {
    konu: "Kesirleri Karşılaştırma",
    seviye: "Normal",
    ikon: "⚖️",
    soru: (
      <>
        <Frac p={5} q={9} /> ile <Frac p={2} q={9} /> kesirlerinden hangisi
        daha büyüktür?
      </>
    ),
    secenekler: [
      <Frac key="a" p={5} q={9} />,
      <Frac key="b" p={2} q={9} />,
      "Eşitler",
      "Bilinemez",
    ],
    dogruCevap: 0,
    ipuclari: [
      "Paydalar aynı (9). Payı büyük olan kesir daha büyüktür.",
      <>
        5 {">"} 2 → <Frac p={5} q={9} /> {">"} <Frac p={2} q={9} />
      </>,
    ],
  },
  {
    konu: "Kesirleri Karşılaştırma",
    seviye: "Zor",
    ikon: "⚖️",
    soru: (
      <>
        <Frac p={3} q={5} /> ile <Frac p={3} q={8} /> kesirlerinden hangisi
        daha büyüktür?
      </>
    ),
    secenekler: [
      <Frac key="a" p={3} q={5} />,
      <Frac key="b" p={3} q={8} />,
      "Eşitler",
      "Bilinemez",
    ],
    dogruCevap: 0,
    ipuclari: [
      "Paylar aynı (3). Paydalara bakmalısın.",
      "Paylar eşitse, paydası küçük olan kesir daha büyüktür.",
      <>
        5 {"<"} 8 → <Frac p={3} q={5} /> {">"} <Frac p={3} q={8} />
      </>,
    ],
  },
  {
    konu: "Bileşik Kesir → Tam Sayılı",
    seviye: "Normal",
    ikon: "🔄",
    soru: (
      <>
        <Frac p={9} q={4} /> bileşik kesrini tam sayılı kesre çeviriniz.
      </>
    ),
    secenekler: [
      <Mixed key="a" w={2} p={1} q={4} />,
      <Mixed key="b" w={3} p={1} q={4} />,
      <Mixed key="c" w={1} p={3} q={4} />,
      <Mixed key="d" w={2} p={3} q={4} />,
    ],
    dogruCevap: 0,
    ipuclari: [
      "9 ÷ 4 → bölüm kaç, kalan kaç?",
      "Bölüm = 2, kalan = 1",
      <>
        Cevap: <Mixed w={2} p={1} q={4} />
      </>,
    ],
  },
  {
    konu: "Bileşik Kesir → Tam Sayılı",
    seviye: "Zor",
    ikon: "🔄",
    soru: (
      <>
        <Frac p={29} q={6} /> bileşik kesrini tam sayılı kesre çeviriniz.
      </>
    ),
    secenekler: [
      <Mixed key="a" w={4} p={3} q={6} />,
      <Mixed key="b" w={5} p={1} q={6} />,
      <Mixed key="c" w={4} p={5} q={6} />,
      <Mixed key="d" w={3} p={5} q={6} />,
    ],
    dogruCevap: 2,
    ipuclari: [
      "29 ÷ 6 → bölüm kaç, kalan kaç?",
      <>
        6 <T /> 4 = 24, kalan = 29 − 24 = 5
      </>,
      <>
        Cevap: <Mixed w={4} p={5} q={6} />
      </>,
    ],
  },
  {
    konu: "Ondalık Gösterim",
    seviye: "Normal",
    ikon: "🔢",
    soru: (
      <>
        <Frac p={7} q={10} /> kesrinin ondalık gösterimi nedir?
      </>
    ),
    secenekler: ["0,07", "0,7", "7,0", "7,10"],
    dogruCevap: 1,
    ipuclari: [
      "Payda 10 → virgülden sonra 1 basamak.",
      "Tam kısmı yok, 0 ile başla.",
      <>
        <Frac p={7} q={10} /> = 0,7
      </>,
    ],
  },
  {
    konu: "Ondalık Gösterim",
    seviye: "Zor",
    ikon: "🔢",
    soru: (
      <>
        <Frac p={253} q={100} /> kesrinin ondalık gösterimi nedir?
      </>
    ),
    secenekler: ["0,253", "25,3", "2,53", "253,0"],
    dogruCevap: 2,
    ipuclari: [
      "Payda 100 → virgülden sonra 2 basamak.",
      "253 ÷ 100 → tam kısım 2, kalan 53",
      <>
        <Frac p={253} q={100} /> = 2,53
      </>,
    ],
  },
  {
    konu: "Dikdörtgen Alanı",
    seviye: "Normal",
    ikon: "📐",
    soru: (
      <>
        Kısa kenarı <strong>5 m</strong>, uzun kenarı <strong>9 m</strong>{" "}
        olan dikdörtgenin alanı kaç m²&apos;dir?
      </>
    ),
    soruAlt: (
      <>
        Alan = 5 <T /> 9
      </>
    ),
    secenekler: ["14 m²", "28 m²", "45 m²", "36 m²"],
    dogruCevap: 2,
    ipuclari: [
      "Alan = kısa kenar × uzun kenar",
      <>
        5 <T /> 9 = ?
      </>,
      <>
        5 <T /> 9 = <strong>45 m²</strong>
      </>,
    ],
  },
  {
    konu: "Dikdörtgen Alanı",
    seviye: "Zor",
    ikon: "📐",
    soru: (
      <>
        Bir dikdörtgenin alanı <strong>96 m²</strong>, uzun kenarı{" "}
        <strong>12 m</strong>. Kısa kenarı kaç metredir?
      </>
    ),
    soruAlt: <>Kısa kenar = Alan ÷ Uzun kenar</>,
    secenekler: ["6 m", "8 m", "10 m", "7 m"],
    dogruCevap: 1,
    ipuclari: [
      "Alan = kısa × uzun → kısa = alan ÷ uzun",
      "96 ÷ 12 = ?",
      <>
        96 ÷ 12 = <strong>8 m</strong>
      </>,
    ],
  },
  {
    konu: "Birim Kesirleri",
    seviye: "Normal",
    ikon: "🟩",
    soru: (
      <>
        Bir daire 6 eşit parçaya bölünmüş, 1 parça boyalı. Boyalı kısmın
        kesir gösterimi nedir?
      </>
    ),
    secenekler: [
      <Frac key="a" p={1} q={3} />,
      <Frac key="b" p={1} q={6} />,
      <Frac key="c" p={2} q={6} />,
      <Frac key="d" p={1} q={8} />,
    ],
    dogruCevap: 1,
    ipuclari: [
      "Toplam 6 eşit parça, 1 tanesi boyalı.",
      <>
        Birim kesir = <Frac p={1} q={"toplam parça"} />
      </>,
      <>
        Cevap: <Frac p={1} q={6} />
      </>,
    ],
  },
  {
    konu: "Birim Kesirleri",
    seviye: "Zor",
    ikon: "🟩",
    soru: (
      <>
        Bir kare 8 eşit parçaya bölünmüş, 3 parça boyalı. Boyalı kısmın
        kesir gösterimi nedir?
      </>
    ),
    secenekler: [
      <Frac key="a" p={1} q={8} />,
      <Frac key="b" p={3} q={8} />,
      <Frac key="c" p={5} q={8} />,
      <Frac key="d" p={3} q={4} />,
    ],
    dogruCevap: 1,
    ipuclari: [
      "Toplam 8 eşit parça, 3 tanesi boyalı.",
      <>
        Kesir = <Frac p={"boyalı"} q={"toplam"} />
      </>,
      <>
        Cevap: <Frac p={3} q={8} />
      </>,
    ],
  },
  {
    konu: "Sayı Doğrusunda Kesir",
    seviye: "Normal",
    ikon: "📍",
    soru: (
      <>
        0 ile 1 arası 5 eşit parçaya bölünmüştür. 2. çizgi hangi kesri
        gösterir?
      </>
    ),
    secenekler: [
      <Frac key="a" p={1} q={5} />,
      <Frac key="b" p={2} q={5} />,
      <Frac key="c" p={3} q={5} />,
      <Frac key="d" p={2} q={10} />,
    ],
    dogruCevap: 1,
    ipuclari: [
      "5 eşit parçaya bölündüyse her çizgi 1/5 artar.",
      <>
        1. çizgi = <Frac p={1} q={5} />, 2. çizgi = ?
      </>,
      <>
        Cevap: <Frac p={2} q={5} />
      </>,
    ],
  },
  {
    konu: "Sayı Doğrusunda Kesir",
    seviye: "Zor",
    ikon: "📍",
    soru: (
      <>
        0 ile 1 arası 8 eşit parçaya bölünmüştür. <Frac p={5} q={8} />{" "}
        kaçıncı çizgidedir?
      </>
    ),
    secenekler: ["3. çizgi", "4. çizgi", "5. çizgi", "6. çizgi"],
    dogruCevap: 2,
    ipuclari: [
      <>
        Her çizgi <Frac p={1} q={8} /> artar.
      </>,
      "Pay kaç ise o kadar çizgi sayarsın.",
      <>
        <Frac p={5} q={8} /> → <strong>5. çizgi</strong>
      </>,
    ],
  },
  {
    konu: "Kesirleri Sıralama",
    seviye: "Normal",
    ikon: "🔢",
    soru: (
      <>
        <Frac p={2} q={9} />, <Frac p={7} q={9} />, <Frac p={4} q={9} />{" "}
        kesirlerini küçükten büyüğe sıralayınız.
      </>
    ),
    secenekler: [
      <>
        <Frac key="a1" p={2} q={9} /> {"<"} <Frac key="a2" p={4} q={9} />{" "}
        {"<"} <Frac key="a3" p={7} q={9} />
      </>,
      <>
        <Frac key="b1" p={7} q={9} /> {"<"} <Frac key="b2" p={4} q={9} />{" "}
        {"<"} <Frac key="b3" p={2} q={9} />
      </>,
      <>
        <Frac key="c1" p={4} q={9} /> {"<"} <Frac key="c2" p={2} q={9} />{" "}
        {"<"} <Frac key="c3" p={7} q={9} />
      </>,
    ],
    dogruCevap: 0,
    ipuclari: [
      "Paydalar aynı (9). Payları küçükten büyüğe sırala.",
      "2 < 4 < 7",
      <>
        <Frac p={2} q={9} /> {"<"} <Frac p={4} q={9} /> {"<"}{" "}
        <Frac p={7} q={9} />
      </>,
    ],
  },
  {
    konu: "Kesirleri Sıralama",
    seviye: "Zor",
    ikon: "🔢",
    soru: (
      <>
        <Frac p={4} q={5} />, <Frac p={4} q={11} />,{" "}
        <Frac p={4} q={3} /> kesirlerini küçükten büyüğe sıralayınız.
      </>
    ),
    secenekler: [
      <>
        <Frac key="a1" p={4} q={11} /> {"<"}{" "}
        <Frac key="a2" p={4} q={5} /> {"<"} <Frac key="a3" p={4} q={3} />
      </>,
      <>
        <Frac key="b1" p={4} q={3} /> {"<"}{" "}
        <Frac key="b2" p={4} q={5} /> {"<"}{" "}
        <Frac key="b3" p={4} q={11} />
      </>,
      <>
        <Frac key="c1" p={4} q={5} /> {"<"}{" "}
        <Frac key="c2" p={4} q={11} /> {"<"}{" "}
        <Frac key="c3" p={4} q={3} />
      </>,
    ],
    dogruCevap: 0,
    ipuclari: [
      "Paylar aynı (4). Paydası büyük olan kesir daha küçüktür.",
      "11 > 5 > 3 → paydası en büyük olan en küçük kesir.",
      <>
        <Frac p={4} q={11} /> {"<"} <Frac p={4} q={5} /> {"<"}{" "}
        <Frac p={4} q={3} />
      </>,
    ],
  },
  {
    konu: "Kesir → Yüzde → Ondalık",
    seviye: "Normal",
    ikon: "🔁",
    soru: (
      <>
        <Frac p={1} q={4} /> kesrinin yüzde gösterimi nedir?
      </>
    ),
    secenekler: ["%14", "%25", "%40", "%50"],
    dogruCevap: 1,
    ipuclari: [
      <>
        Paydayı 100&apos;e getir: <Frac p={1} q={4} /> ={" "}
        <Frac p={"?"} q={100} />
      </>,
      <>
        4 <T /> 25 = 100, o halde 1 <T /> 25 = 25
      </>,
      <>
        <Frac p={25} q={100} /> = %25
      </>,
    ],
  },
  {
    konu: "Kesir → Yüzde → Ondalık",
    seviye: "Zor",
    ikon: "🔁",
    soru: (
      <>
        <Frac p={7} q={20} /> kesrinin ondalık gösterimi nedir?
      </>
    ),
    secenekler: ["0,35", "0,70", "0,27", "3,5"],
    dogruCevap: 0,
    ipuclari: [
      <>
        Paydayı 100&apos;e getir: 20 <T /> 5 = 100
      </>,
      <>
        Pay ve paydayı 5 ile çarp: <Frac p={7} q={20} /> ={" "}
        <Frac p={35} q={100} />
      </>,
      <>
        <Frac p={35} q={100} /> = 0,35
      </>,
    ],
  },
  {
    konu: "Kesir Problemi",
    seviye: "Normal",
    ikon: "🪣",
    soru: (
      <>
        6 litre süt 4 bardağa eşit olarak paylaştırılıyor. Bir bardakta kaç
        litre süt olur?
      </>
    ),
    secenekler: [
      <>
        <Mixed key="a" w={1} p={2} q={4} /> litre
      </>,
      <>
        <Frac key="b" p={4} q={6} /> litre
      </>,
      <>
        <Mixed key="c" w={1} p={1} q={2} /> litre
      </>,
      <>
        <Mixed key="d" w={2} p={2} q={4} /> litre
      </>,
    ],
    dogruCevap: 2,
    ipuclari: [
      <>
        6 litre ÷ 4 bardak = <Frac p={6} q={4} />
      </>,
      <>
        6 ÷ 4 → bölüm 1, kalan 2 → <Mixed w={1} p={2} q={4} />
      </>,
      <>
        <Frac p={2} q={4} /> sadeleşir → <Frac p={1} q={2} /> → Cevap:{" "}
        <Mixed w={1} p={1} q={2} /> litre
      </>,
    ],
  },
  {
    konu: "Kesir Problemi",
    seviye: "Zor",
    ikon: "🪣",
    soru: (
      <>
        15 litre su 4 bidona eşit olarak paylaştırılıyor. Bir bidonda kaç
        litre su vardır? Ondalık gösterimle yazınız.
      </>
    ),
    secenekler: ["3,5", "3,75", "4,25", "3,25"],
    dogruCevap: 1,
    ipuclari: [
      <>
        15 ÷ 4 = <Frac p={15} q={4} />
      </>,
      <>
        15 ÷ 4 → bölüm 3, kalan 3 → <Mixed w={3} p={3} q={4} />
      </>,
      <>
        <Frac p={3} q={4} /> = <Frac p={75} q={100} /> = 0,75 → Cevap:
        3,75
      </>,
    ],
  },
];
