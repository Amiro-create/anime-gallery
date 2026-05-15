import ScenePageClient from './client'

export default async function ScenePage({
  params,
}: {
  params: Promise<{ id: string; sceneId: string }>
}) {
  const { id, sceneId } = await params
  return <ScenePageClient animeId={id} sceneId={sceneId} />
}
