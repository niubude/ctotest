import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommitList } from '@/components/commit-list'
import { SVNCommit } from '@/app/api/svn/commits/route'

const mockCommits: SVNCommit[] = [
  {
    revision: 1234,
    author: 'john.doe',
    date: new Date('2024-01-15T10:30:00Z').toISOString(),
    message: 'Fix authentication bug',
    changedPaths: ['/trunk/src/auth/login.ts'],
  },
  {
    revision: 1233,
    author: 'jane.smith',
    date: new Date('2024-01-14T15:45:00Z').toISOString(),
    message: 'Add new dashboard feature',
    changedPaths: ['/trunk/src/dashboard/index.ts'],
  },
]

describe('CommitList', () => {
  const mockOnCommitSelect = jest.fn()
  const mockOnCommitClick = jest.fn()
  const mockOnFilterChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders commit list correctly', () => {
    render(
      <CommitList
        commits={mockCommits}
        selectedCommits={new Set()}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByText('r1234')).toBeInTheDocument()
    expect(screen.getByText('john.doe')).toBeInTheDocument()
    expect(screen.getByText('Fix authentication bug')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <CommitList
        commits={[]}
        selectedCommits={new Set()}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
        isLoading={true}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading commits...')).toBeInTheDocument()
  })

  it('shows empty state when no commits', () => {
    render(
      <CommitList
        commits={[]}
        selectedCommits={new Set()}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByText('No commits found')).toBeInTheDocument()
  })

  it('handles commit selection', async () => {
    const user = userEvent.setup()

    render(
      <CommitList
        commits={mockCommits}
        selectedCommits={new Set()}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    const checkbox = screen.getByTestId('commit-checkbox-1234')
    await user.click(checkbox)

    expect(mockOnCommitSelect).toHaveBeenCalledWith(1234, true)
  })

  it('handles multiple commit selection', async () => {
    const user = userEvent.setup()
    const selectedCommits = new Set([1234])

    render(
      <CommitList
        commits={mockCommits}
        selectedCommits={selectedCommits}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByText('1 commit selected')).toBeInTheDocument()

    const checkbox = screen.getByTestId('commit-checkbox-1233')
    await user.click(checkbox)

    expect(mockOnCommitSelect).toHaveBeenCalledWith(1233, true)
  })

  it('handles commit row click', async () => {
    const user = userEvent.setup()

    render(
      <CommitList
        commits={mockCommits}
        selectedCommits={new Set()}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    const row = screen.getByTestId('commit-row-1234')
    await user.click(row)

    expect(mockOnCommitClick).toHaveBeenCalledWith(mockCommits[0])
  })

  it('handles keyword filter input', async () => {
    const user = userEvent.setup()

    render(
      <CommitList
        commits={mockCommits}
        selectedCommits={new Set()}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    const keywordInput = screen.getByTestId('keyword-filter')
    await user.type(keywordInput, 'authentication')

    const applyButton = screen.getByTestId('apply-filters')
    await user.click(applyButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      keyword: 'authentication',
      author: '',
    })
  })

  it('handles author filter input', async () => {
    const user = userEvent.setup()

    render(
      <CommitList
        commits={mockCommits}
        selectedCommits={new Set()}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    const authorInput = screen.getByTestId('author-filter')
    await user.type(authorInput, 'john')

    const applyButton = screen.getByTestId('apply-filters')
    await user.click(applyButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      keyword: '',
      author: 'john',
    })
  })

  it('handles filter submission via Enter key', async () => {
    const user = userEvent.setup()

    render(
      <CommitList
        commits={mockCommits}
        selectedCommits={new Set()}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    const keywordInput = screen.getByTestId('keyword-filter')
    await user.type(keywordInput, 'bug{Enter}')

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      keyword: 'bug',
      author: '',
    })
  })

  it('displays selection summary correctly', () => {
    const selectedCommits = new Set([1234, 1233])

    render(
      <CommitList
        commits={mockCommits}
        selectedCommits={selectedCommits}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByText('2 commits selected')).toBeInTheDocument()
  })

  it('persists selection across filter changes', () => {
    const selectedCommits = new Set([1234])

    const { rerender } = render(
      <CommitList
        commits={mockCommits}
        selectedCommits={selectedCommits}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByText('1 commit selected')).toBeInTheDocument()

    rerender(
      <CommitList
        commits={[mockCommits[0]]}
        selectedCommits={selectedCommits}
        onCommitSelect={mockOnCommitSelect}
        onCommitClick={mockOnCommitClick}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByText('1 commit selected')).toBeInTheDocument()
    const checkbox = screen.getByTestId('commit-checkbox-1234')
    expect(checkbox).toBeChecked()
  })
})
