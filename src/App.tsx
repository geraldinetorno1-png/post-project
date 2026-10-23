import PostList from '@/features/post/components/PostList'

export default function App() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Posts</h1>
      <PostList />
    </main>
  )
}
