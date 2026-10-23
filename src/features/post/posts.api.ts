import { api } from '@/lib/api'

export interface Post {
  id: number
  title: string
  body: string
}

export async function getPosts(signal?: AbortSignal): Promise<Post[]> {
  const { data } = await api.get<Post[]>('/posts', { signal })
  if (
    !Array.isArray(data) ||
    data.some((post) =>
      post === null ||
      typeof post !== 'object' ||
      typeof post.id !== 'number' ||
      typeof post.title !== 'string' ||
      typeof post.body !== 'string'
    )
  ) {
    throw new Error('The posts API returned an invalid response.')
  }
  return data
}
