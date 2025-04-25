import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/Button';
import { useToast } from './ui/use-toast';
import { Moon, Sun, Monitor } from 'lucide-react';

interface ThemeOption {
  name: string;
  icon: React.ReactNode;
  value: 'light' | 'dark' | 'system';
}

const themeOptions: ThemeOption[] = [
  {
    name: 'Light',
    icon: <Sun className="h-5 w-5" />,
    value: 'light',
  },
  {
    name: 'Dark',
    icon: <Moon className="h-5 w-5" />,
    value: 'dark',
  },
  {
    name: 'System',
    icon: <Monitor className="h-5 w-5" />,
    value: 'system',
  },
];

export const ThemeCustomization: React.FC = () => {
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = React.useState<'light' | 'dark' | 'system'>('system');

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    try {
      setSelectedTheme(theme);
      // Here you would typically update the theme in your app's state management
      toast({
        title: 'Success',
        description: `Theme changed to ${theme}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change theme',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Theme Customization</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose your preferred theme to personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themeOptions.map((option) => (
          <Card
            key={option.value}
            className={`p-6 cursor-pointer transition-all ${
              selectedTheme === option.value
                ? 'border-primary shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleThemeChange(option.value)}
          >
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                {option.icon}
              </div>
              <h3 className="text-xl font-semibold">{option.name}</h3>
              {selectedTheme === option.value && (
                <p className="text-sm text-primary">Currently selected</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => {
            // Here you would typically reset to default theme
            handleThemeChange('system');
          }}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
}; 