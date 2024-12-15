import type { MetadataRoute } from "next";
import { unstable_noStore } from "next/cache";
import { sanityFetch } from "@/sanity/lib/fetch";
import { postSlugsQuery } from "@/sanity/lib/queries";

async function getBlogPosts() {
  const posts = await sanityFetch<{ slug: string; date: string }[]>({
    query: postSlugsQuery,
  });
  return posts.map((post) => ({
    url: `https://mailto.live/blog/post/${post.slug}`,
    lastModified: new Date(post.date),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // to try fix caching issue: https://github.com/vercel/next.js/discussions/56708#discussioncomment-10127496
  unstable_noStore();

  const blogPosts = await getBlogPosts();

  const staticUrls = [
    {
      url: "https://mailto.live/",
      priority: 1,
    },
    {
      url: "https://mailto.live/bulk-email-unsubscriber",
    },
    {
      url: "https://mailto.live/ai-automation",
    },
    {
      url: "https://mailto.live/email-analytics",
    },
    {
      url: "https://mailto.live/block-cold-emails",
    },
    {
      url: "https://mailto.live/new-email-senders",
    },
    {
      url: "https://mailto.live/privacy",
    },
    {
      url: "https://mailto.live/terms",
    },
    {
      url: "https://mailto.live/blog",
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://mailto.live/blog/post/how-my-open-source-saas-hit-first-on-product-hunt",
    },
    {
      url: "https://mailto.live/blog/post/why-build-an-open-source-saas",
    },
    {
      url: "https://mailto.live/blog/post/alternatives-to-skiff-mail",
    },
    {
      url: "https://mailto.live/blog/post/best-email-unsubscribe-app",
    },
    {
      url: "https://mailto.live/blog/post/bulk-unsubscribe-from-emails",
    },
    {
      url: "https://mailto.live/blog/post/escape-email-trap-unsubscribe-for-good",
    },
    {
      url: "https://docs.getinboxzero.com/",
    },
    {
      url: "https://docs.getinboxzero.com/introduction",
    },
    {
      url: "https://docs.getinboxzero.com/essentials/email-ai-automation",
    },
    {
      url: "https://docs.getinboxzero.com/essentials/bulk-email-unsubscriber",
    },
    {
      url: "https://docs.getinboxzero.com/essentials/cold-email-blocker",
    },
  ];

  return [...staticUrls, ...blogPosts];
}
