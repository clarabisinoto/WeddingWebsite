const ML_IDS = [
  "MLB52937122","MLB16051359","MLB15553603","MLB45070708","MLB19120023",
  "MLB2990611492","MLB13852467","MLB47816179","MLB32485984","MLB34695705",
  "MLB4332167297","MLB37758006","MLB3745190191","MLB5629562838","MLB32595060",
  "MLB34811252","MLB32489412","MLB32486274","MLB32811872","MLB33308125",
  "MLB24440801","MLB23973741","MLB46192801","MLB46644251","MLB52435039",
  "MLB43013374","MLB33691830","MLB52932684","MLB32005043","MLB5831725924",
  "MLB28111099","MLB32443370","MLB5759951784","MLB34834210","MLB4506346751",
  "MLB25683213","MLB4304500829","MLB28601099","MLB26150097","MLB47126979",
  "MLB28268564","MLB17351734","MLB28038602","MLB33795714","MLB40053237",
  "MLB27617925"
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");

  try {
    const chunks = [];
    for (let i = 0; i < ML_IDS.length; i += 20) {
      chunks.push(ML_IDS.slice(i, i + 20));
    }

    const allItems = [];
    for (const chunk of chunks) {
      const ids = chunk.join(",");
      const response = await fetch(
        `https://api.mercadolibre.com/items?ids=${ids}&attributes=id,title,price,thumbnail,permalink,status,pictures`,
        { headers: { "Accept": "application/json" } }
      );
      const data = await response.json();
      for (const entry of data) {
        if (entry.code === 200 && entry.body) {
          const item = entry.body;
          allItems.push({
            id: item.id,
            name: item.title || item.id,
            price: item.price ? "R$ " + parseFloat(item.price).toFixed(2).replace(".", ",") : "",
            img: item.pictures && item.pictures.length > 0
              ? item.pictures[0].url.replace("http://", "https://").replace("-I.jpg", "-O.jpg")
              : (item.thumbnail ? item.thumbnail.replace("http://", "https://").replace("-I.jpg", "-O.jpg") : ""),
            url: item.permalink || ("https://www.mercadolivre.com.br/p/" + item.id),
            status: item.status || "active"
          });
        }
      }
    }

    res.status(200).json(allItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
