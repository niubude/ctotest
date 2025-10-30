import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export type FileDiff = {
  path: string
  oldContent: string
  newContent: string
  changeType: 'added' | 'modified' | 'deleted'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const repositoryId = searchParams.get('repositoryId')
    const revision = searchParams.get('revision')

    if (!repositoryId || !revision) {
      return NextResponse.json(
        { error: 'Repository ID and revision are required' },
        { status: 400 }
      )
    }

    const mockDiffs: FileDiff[] = [
      {
        path: '/trunk/src/auth/login.ts',
        changeType: 'modified',
        oldContent: `export function login(username: string, password: string) {
  if (!username || !password) {
    throw new Error('Invalid credentials');
  }
  
  const user = database.findUser(username);
  if (!user || user.password !== password) {
    throw new Error('Invalid credentials');
  }
  
  return generateToken(user);
}`,
        newContent: `export function login(username: string, password: string) {
  if (!username || !password) {
    throw new Error('Invalid credentials');
  }
  
  const user = database.findUser(username);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (!verifyPassword(password, user.hashedPassword)) {
    throw new Error('Invalid credentials');
  }
  
  return generateToken(user);
}`,
      },
      {
        path: '/trunk/tests/auth.test.ts',
        changeType: 'modified',
        oldContent: `describe('login', () => {
  it('should authenticate valid user', () => {
    const token = login('testuser', 'password123');
    expect(token).toBeDefined();
  });
});`,
        newContent: `describe('login', () => {
  it('should authenticate valid user', () => {
    const token = login('testuser', 'password123');
    expect(token).toBeDefined();
  });
  
  it('should use hashed password verification', () => {
    const mockUser = { username: 'test', hashedPassword: 'hash123' };
    jest.spyOn(database, 'findUser').mockReturnValue(mockUser);
    
    login('test', 'password');
    expect(verifyPassword).toHaveBeenCalled();
  });
});`,
      },
    ]

    return NextResponse.json(mockDiffs)
  } catch (error) {
    console.error('Error fetching diff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch diff' },
      { status: 500 }
    )
  }
}
