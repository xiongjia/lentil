import { Button } from '@lentil/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@lentil/ui/card'
import { MapView } from '@lentil/ui/map'
import { ThemeToggle, useTheme } from '@lentil/ui/theme-toggle'

function App() {
  const { isDark } = useTheme()

  const setLight = () => {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }

  const setDark = () => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }

  return (
    <main style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          UI Components Playground
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={setLight}
            aria-pressed={!isDark}
          >
            Light
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={setDark}
            aria-pressed={isDark}
          >
            Dark
          </Button>
          <ThemeToggle className="rounded-md border p-2 hover:bg-accent" />
        </div>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Card</h2>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content paragraph.</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Map</h2>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>MapLibre GL</CardTitle>
            <CardDescription>Basic map with OpenStreetMap tiles</CardDescription>
          </CardHeader>
          <CardContent>
            <MapView className="rounded-md" />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Theme Demo</h2>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Current Theme</CardTitle>
            <CardDescription>Click Light or Dark button to switch themes</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>Background:</span>
                <div style={{ width: '2rem', height: '1.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }} />
                <span style={{ color: 'var(--color-foreground)', fontFamily: 'monospace' }}>var(--color-background)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, flexShrink: 0, width: '6rem' }}>Foreground:</span>
                <div style={{ width: '2rem', height: '1.5rem', backgroundColor: 'var(--color-foreground)', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }} />
                <span style={{ color: 'var(--color-foreground)', fontFamily: 'monospace' }}>var(--color-foreground)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>Primary:</span>
                <div style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', padding: '0.25rem 0.75rem', borderRadius: '0.25rem' }}>
                  Primary
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>Secondary:</span>
                <div style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)', padding: '0.25rem 0.75rem', borderRadius: '0.25rem' }}>
                  Secondary
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>Destructive:</span>
                <div style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)', padding: '0.25rem 0.75rem', borderRadius: '0.25rem' }}>
                  Destructive
                </div>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>Border:</span>
                <div style={{ width: '2rem', height: '1.5rem', backgroundColor: 'var(--color-input)', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default App