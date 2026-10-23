import { Button } from '@/components/ui/button'
import { useGetPosts } from '../posts.hooks'

export default function PostList() {
  const { data: posts, isPending, isError, isFetching, refetch } = useGetPosts()

  if (isPending) return <p role="status">Getting your posts...</p>

  if (isError && !posts) {
    return (
      <div role="alert">
        <p>We couldn’t load your posts. Give it another try.</p>
        <Button disabled={isFetching} onClick={() => void refetch()}>
          {isFetching ? 'Retrying...' : 'Try again'}
        </Button>
      </div>
    )
  }

  if (posts.length === 0) return <p>No posts yet.</p>

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">{post.title}</h2>
          <p className="mt-2 whitespace-pre-wrap">{post.body}</p>
        </li>
      ))}
    </ul>
  )
}
