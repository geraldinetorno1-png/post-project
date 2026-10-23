import { useQuery } from '@tanstack/react-query'
import { getPosts } from './posts.api'

export function useGetPosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: ({ signal }) => getPosts(signal),
  })
}
