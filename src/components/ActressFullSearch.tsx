'use client';

import { useState } from 'react';

const INITIALS = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や',      'ゆ',      'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ'
];

const API_ID = 'huPPFMrFc76bHbCs9nLX';
const AFFILIATE_ID = 'ashirio-990';
const BASE_URL = 'https://api.dmm.com/affiliate/v3/ActressSearch';

type Actress = {
  id: string;
  name: string;
  birthday?: string;
  imageURL?: { large: string };
  height?: string;
  bust?: string;
  waist?: string;
  hip?: string;
  cup?: string;
};

const calcAge = (birthday: string | undefined): number => {
  if (!birthday) return 9999;
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export function ActressFullSearch({ onActressClick }: { onActressClick: (name: string) => void }) {
  const [ageMin, setAgeMin] = useState('18');
  const [ageMax, setAgeMax] = useState('');
  const [heightMin, setHeightMin] = useState('');
  const [heightMax, setHeightMax] = useState('');
  const [bustMin, setBustMin] = useState('');
  const [bustMax, setBustMax] = useState('');
  const [waistMin, setWaistMin] = useState('');
  const [waistMax, setWaistMax] = useState('');
  const [hipMin, setHipMin] = useState('');
  const [hipMax, setHipMax] = useState('');
  const [selectedCups, setSelectedCups] = useState<string[]>([]);
  const [actresses, setActresses] = useState<Actress[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(false);
    let allResults: Actress[] = [];

    for (const initial of INITIALS) {
      for (let offset = 1; offset <= 500; offset += 100) {
        const params = new URLSearchParams({
          api_id: API_ID,
          affiliate_id: AFFILIATE_ID,
          initial,
          output: 'json',
          hits: '100',
          offset: offset.toString(),
        });
        const res = await fetch(`${BASE_URL}?${params.toString()}`);
        const json = await res.json();
        if (!json.result?.actress?.length) break;
        allResults = [...allResults, ...json.result.actress];
        if (json.result.actress.length < 100) break;
      }
    }

    const uniqueMap = new Map<string, Actress>();
    allResults.forEach((a) => {
      if (!uniqueMap.has(a.id)) uniqueMap.set(a.id, a);
    });

    // ★ カップ判定関数をhandleSearch内に定義
    const isCupMatch = (cup: string | undefined): boolean => {
      if (!cup) return false;
      if (selectedCups.length === 0) return true;
      if (selectedCups.includes(cup)) return true;

      const largeCups = ['L', 'M', 'N', 'O', 'P', 'Q'];
      if (selectedCups.includes('L～') && largeCups.includes(cup)) return true;

      return false;
    };

    const filtered = Array.from(uniqueMap.values())
      .filter((a) => a.imageURL?.large)
      .filter((a) => {
        const age = calcAge(a.birthday);
        if (age === 9999) return false;
        if (ageMin && age < parseInt(ageMin)) return false;
        if (ageMax && age > parseInt(ageMax)) return false;
        return true;
      })
      .filter((a) => {
        if (heightMin && (!a.height || parseInt(a.height) < parseInt(heightMin))) return false;
        if (heightMax && (!a.height || parseInt(a.height) > parseInt(heightMax))) return false;
        if (bustMin && (!a.bust || parseInt(a.bust) < parseInt(bustMin))) return false;
        if (bustMax && (!a.bust || parseInt(a.bust) > parseInt(bustMax))) return false;
        if (waistMin && (!a.waist || parseInt(a.waist) < parseInt(waistMin))) return false;
        if (waistMax && (!a.waist || parseInt(a.waist) > parseInt(waistMax))) return false;
        if (hipMin && (!a.hip || parseInt(a.hip) < parseInt(hipMin))) return false;
        if (hipMax && (!a.hip || parseInt(a.hip) > parseInt(hipMax))) return false;
        return true;
      })
      // ★ ここをisCupMatchに置き換え
      .filter((a) => isCupMatch(a.cup))
      .sort((a, b) => calcAge(a.birthday) - calcAge(b.birthday));

    setActresses(filtered);
    setLoading(false);
    setSearched(true);
  };

  return (
    <div>
      <div className="input-group-vertical">
        <div className="input-line">
          <label>年齢：</label>
          <div className="range-inputs">
            <input type="number" value={ageMin} min={18} onChange={(e) => setAgeMin(e.target.value)} placeholder="最小" />
            〜
            <input type="number" value={ageMax} min={18} onChange={(e) => setAgeMax(e.target.value)} placeholder="最大" />
          </div>
        </div>

        <div className="input-line">
          <label>身長：</label>
          <div className="range-inputs">
            <input type="number" value={heightMin} onChange={(e) => setHeightMin(e.target.value)} placeholder="最小" />
            〜
            <input type="number" value={heightMax} onChange={(e) => setHeightMax(e.target.value)} placeholder="最大" />
          </div>
        </div>

        <div className="input-line">
          <label>バスト：</label>
          <div className="range-inputs">
            <input type="number" value={bustMin} onChange={(e) => setBustMin(e.target.value)} placeholder="最小" />
            〜
            <input type="number" value={bustMax} onChange={(e) => setBustMax(e.target.value)} placeholder="最大" />
          </div>
        </div>

        <div className="input-line">
          <label>ウエスト：</label>
          <div className="range-inputs">
            <input type="number" value={waistMin} onChange={(e) => setWaistMin(e.target.value)} placeholder="最小" />
            〜
            <input type="number" value={waistMax} onChange={(e) => setWaistMax(e.target.value)} placeholder="最大" />
          </div>
        </div>

        <div className="input-line">
          <label>ヒップ：</label>
          <div className="range-inputs">
            <input type="number" value={hipMin} onChange={(e) => setHipMin(e.target.value)} placeholder="最小" />
            〜
            <input type="number" value={hipMax} onChange={(e) => setHipMax(e.target.value)} placeholder="最大" />
          </div>
        </div>

        <div className="input-line">
          <label>カップ：</label>
          <div className="cup-checkbox-group">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L～'].map((cup) => (
              <label key={cup} className="cup-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCups.includes(cup)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCups([...selectedCups, cup]);
                    } else {
                      setSelectedCups(selectedCups.filter((c) => c !== cup));
                    }
                  }}
                />
                {cup}
              </label>
            ))}
          </div>
        </div>

        <button onClick={handleSearch}>検索</button>
      </div>

      {loading && <p>検索中...</p>}

      {searched && (
        actresses.length === 0
          ? <p>該当する検索結果はありません</p>
          : <div className="actress-grid">
              {actresses.map((a) => (
                <div key={a.id} className="card" onClick={() => onActressClick(a.name)} style={{ cursor: 'pointer' }}>
                  <img src={a.imageURL!.large} alt={a.name} />
                  <p>{a.name}<br />（{calcAge(a.birthday)}歳）/ {a.cup || '-'}カップ</p>
                  <p>H:{a.height} / B:{a.bust} <br /> W:{a.waist} / H:{a.hip}</p>
                </div>
              ))}
            </div>
      )}
    </div>
  );
}
