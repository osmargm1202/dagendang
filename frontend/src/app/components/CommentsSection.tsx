"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Comment {
  id: number;
  content: string;
  user_full_name: string;
  created_at: string;
  is_verified_user?: boolean; // We can add this logic later if needed
}

export default function CommentsSection({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: number; full_name: string; is_verified: boolean } | null>(null);

  useEffect(() => {
    fetchComments();
    checkUser();
  }, [articleId]);

  const checkUser = async () => {
    const token = localStorage.getItem("user_token");
    if (!token) return;

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (e) {
      console.error("Error checking user:", e);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments/articles/${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem("user_token");
    if (!token) {
      setError("Inicia sesión para comentar.");
      return;
    }

    setIsPosting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment,
          article_id: articleId
        })
      });

      if (res.ok) {
        const postedComment = await res.json();
        setComments([postedComment, ...comments]);
        setNewComment("");
      } else {
        const data = await res.json();
        setError(data.detail || "Error al publicar comentario.");
      }
    } catch (e) {
      setError("Error de conexión al servidor.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <h3 className="text-xl font-black text-foreground flex items-center gap-3 tracking-tighter uppercase mb-8">
        <span className="w-8 h-1 bg-dr-blue"></span>
        Comentarios ({comments.length})
      </h3>

      {/* Comment Form */}
      <div className="mb-12 bg-muted p-6 rounded-lg border border-border">
        {!user ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Inicia sesión para unirte a la conversación.</p>
            <div className="flex justify-center gap-4">
              <Link href="/login" className="px-6 py-2 bg-dr-blue text-white font-bold rounded-sm text-sm uppercase tracking-wider">Iniciar Sesión</Link>
              <Link href="/registro" className="px-6 py-2 border border-dr-blue text-dr-blue font-bold rounded-sm text-sm uppercase tracking-wider">Registrarse</Link>
            </div>
          </div>
        ) : !user.is_verified ? (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700 font-medium">
                  Cuenta no verificada. Por favor, revisa tu correo y activa tu cuenta para poder comentar.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePostComment}>
            <textarea
              className="w-full p-4 border border-border rounded-md focus:ring-dr-blue focus:border-dr-blue resize-none min-h-[100px] text-sm bg-card text-foreground"
              placeholder="Escribe tu opinión con respeto..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isPosting}
            ></textarea>
            {error && <p className="text-dr-red text-xs mt-2 font-bold">{error}</p>}
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isPosting || !newComment.trim()}
                className="px-8 py-3 bg-dr-blue text-white font-bold rounded-sm text-xs uppercase tracking-widest hover:bg-dr-blue/90 transition-all disabled:bg-muted-foreground/30"
              >
                {isPosting ? "Publicando..." : "Publicar Comentario"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dr-blue"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 italic font-serif">Aún no hay comentarios en esta noticia. ¡Sé el primero en opinar!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="flex-shrink-0 w-10 h-10 bg-dr-blue/10 rounded-full flex items-center justify-center text-dr-blue font-bold">
                {comment.user_full_name[0].toUpperCase()}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-foreground">{comment.user_full_name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {new Date(comment.created_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm text-foreground leading-relaxed bg-card p-4 rounded-lg rounded-tl-none border border-border shadow-sm group-hover:border-dr-blue/20 transition-all">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
