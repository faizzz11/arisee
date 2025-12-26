"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: {
        name: string;
    };
}

export default function News() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('/api/news');
                if (!response.ok) {
                    throw new Error('Failed to fetch news');
                }
                const data = await response.json();
                setNews(data.articles || []);
            } catch (err) {
                setError('Failed to load news');
                console.error('Error fetching news:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded-lg"></div>
                    ))}
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="text-center text-red-500">{error}</div>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-white shadow-sm rounded-xl border border-slate-200">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Newspaper className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Latest News</h2>
                </div>
                <div className="space-y-4">
                    {news.slice(0, 5).map((article, index) => (
                        <a
                            key={index}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block hover:bg-slate-50 p-3 rounded-lg transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {article.urlToImage && (
                                    <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        className="w-20 h-20 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://placehold.co/80x80?text=News';
                                        }}
                                    />
                                )}
                                <div className="flex-grow">
                                    <h3 className="font-medium text-slate-800 text-sm line-clamp-2 mb-1">
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">
                                            {new Date(article.publishedAt).toLocaleDateString()}
                                        </span>
                                        <ExternalLink className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </Card>
    );
} 