import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BANGUMI_API = "https://api.bgm.tv";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BangumiSubject {
  id: number;
  name: string;
  name_cn: string;
  summary: string;
  eps: number;
  images?: {
    large: string;
    common: string;
  };
  tags?: Array<{ name: string; count: number }>;
}

interface BangumiSearchResult {
  list?: BangumiSubject[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const keyword = url.searchParams.get("keyword");
    const bangumiId = url.searchParams.get("id");

    if (!keyword && !bangumiId) {
      return new Response(
        JSON.stringify({ error: "请提供 keyword 或 id 参数" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let subject: BangumiSubject;

    if (bangumiId) {
      const resp = await fetch(`${BANGUMI_API}/v0/subjects/${bangumiId}`, {
        headers: { "User-Agent": "anime-gallery/1.0" },
      });
      if (!resp.ok) throw new Error(`Bangumi API ${resp.status}`);
      subject = await resp.json();
    } else {
      const resp = await fetch(
        `${BANGUMI_API}/search/subject/${encodeURIComponent(keyword!)}?type=2&responseGroup=large`,
        { headers: { "User-Agent": "anime-gallery/1.0" } },
      );
      if (!resp.ok) throw new Error(`Bangumi API ${resp.status}`);
      const data: BangumiSearchResult = await resp.json();
      if (!data.list || data.list.length === 0) {
        return new Response(
          JSON.stringify({ error: "未找到匹配的番剧" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      subject = data.list[0];
    }

    /* ---------- 写入 Supabase ---------- */
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const animeData = {
      title: subject.name_cn || subject.name,
      cover_url: subject.images?.large || subject.images?.common || "",
      banner_url: subject.images?.large || "",
      description: subject.summary || "",
      episode_count: subject.eps || null,
      tags: (subject.tags || []).slice(0, 10).map((t) => t.name),
    };

    const { data, error } = await supabase
      .from("anime")
      .insert(animeData)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
