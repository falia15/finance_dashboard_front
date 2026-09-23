import { useQuery } from '@tanstack/react-query'
import { Alert, Badge, Container, Loader, Stack, Text, Title } from '@mantine/core'
import { apiFetch } from '../api/client'

interface ApiEntrypoint {
  '@context': string
  '@id': string
  '@type': string
}

function useApiEntrypoint() {
  return useQuery({
    queryKey: ['api-entrypoint'],
    queryFn: () => apiFetch<ApiEntrypoint>('/'),
  })
}

export function Home() {
  const { data, isLoading, isError, error } = useApiEntrypoint()

  return (
    <Container py="xl">
      <Stack gap="md">
        <Title order={1}>Front connecté à l'API</Title>

        {isLoading && <Loader />}

        {isError && (
          <Alert color="red" title="Impossible de joindre l'API">
            {error instanceof Error ? error.message : 'Erreur inconnue'}
          </Alert>
        )}

        {data && (
          <Stack gap="xs">
            <Text>L'API répond, voici les ressources exposées :</Text>
            <Badge>{data['@type']}</Badge>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
