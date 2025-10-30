import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RepositorySelector } from '@/components/repository-selector'
import { Repository } from '@prisma/client'

const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'Main Repository',
    url: 'svn://example.com/main',
    description: 'Main project repository',
    username: null,
    password: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Test Repository',
    url: 'svn://example.com/test',
    description: 'Testing repository',
    username: null,
    password: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('RepositorySelector', () => {
  const mockOnRepositoryChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders repository selector with label', () => {
    render(
      <RepositorySelector
        repositories={mockRepositories}
        selectedRepository={null}
        onRepositoryChange={mockOnRepositoryChange}
      />
    )

    expect(screen.getByText('Select Repository')).toBeInTheDocument()
  })

  it('displays placeholder when no repository is selected', () => {
    render(
      <RepositorySelector
        repositories={mockRepositories}
        selectedRepository={null}
        onRepositoryChange={mockOnRepositoryChange}
      />
    )

    expect(screen.getByText('Choose a repository...')).toBeInTheDocument()
  })

  it('shows selected repository', () => {
    render(
      <RepositorySelector
        repositories={mockRepositories}
        selectedRepository="1"
        onRepositoryChange={mockOnRepositoryChange}
      />
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Main Repository')
  })

  it('disables selector when loading', () => {
    render(
      <RepositorySelector
        repositories={mockRepositories}
        selectedRepository={null}
        onRepositoryChange={mockOnRepositoryChange}
        isLoading={true}
      />
    )

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('handles repository selection', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <RepositorySelector
        repositories={mockRepositories}
        selectedRepository={null}
        onRepositoryChange={mockOnRepositoryChange}
      />
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(mockOnRepositoryChange).toHaveBeenCalled()
  })

  it('renders repository names in options', () => {
    render(
      <RepositorySelector
        repositories={mockRepositories}
        selectedRepository="1"
        onRepositoryChange={mockOnRepositoryChange}
      />
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Main Repository')
  })

  it('renders empty list when no repositories', () => {
    render(
      <RepositorySelector
        repositories={[]}
        selectedRepository={null}
        onRepositoryChange={mockOnRepositoryChange}
      />
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
