import { render, screen, fireEvent } from '@testing-library/react';
import { EmojiGrid } from '@/components/EmojiGrid';
import { EMOJI_OPTIONS } from '@/constants/emojis';

const mockOnEmojiSelect = jest.fn();
const mockOnEmojiRemove = jest.fn();

const defaultProps = {
  emojis: EMOJI_OPTIONS,
  selectedEmojis: [],
  onEmojiSelect: mockOnEmojiSelect,
  onEmojiRemove: mockOnEmojiRemove,
};

describe('EmojiGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all emojis', () => {
    render(<EmojiGrid {...defaultProps} />);
    
    EMOJI_OPTIONS.forEach((emoji) => {
      expect(screen.getByText(emoji.emoji)).toBeInTheDocument();
      expect(screen.getByText(emoji.label)).toBeInTheDocument();
    });
  });

  it('calls onEmojiSelect when emoji is clicked', () => {
    render(<EmojiGrid {...defaultProps} />);
    
    const firstEmoji = screen.getByText(EMOJI_OPTIONS[0].emoji).closest('button');
    fireEvent.click(firstEmoji!);
    
    expect(mockOnEmojiSelect).toHaveBeenCalledWith(EMOJI_OPTIONS[0]);
  });

  it('shows selected emojis in the selected section', () => {
    const selectedEmojis = [EMOJI_OPTIONS[0], EMOJI_OPTIONS[1]];
    
    render(
      <EmojiGrid 
        {...defaultProps} 
        selectedEmojis={selectedEmojis} 
      />
    );
    
    expect(screen.getByText('Emoji đã chọn:')).toBeInTheDocument();
    selectedEmojis.forEach((emoji) => {
      expect(screen.getByText(emoji.emoji)).toBeInTheDocument();
      expect(screen.getByText(emoji.label)).toBeInTheDocument();
    });
  });

  it('calls onEmojiRemove when remove button is clicked', () => {
    const selectedEmojis = [EMOJI_OPTIONS[0]];
    
    render(
      <EmojiGrid 
        {...defaultProps} 
        selectedEmojis={selectedEmojis} 
      />
    );
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    expect(mockOnEmojiRemove).toHaveBeenCalledWith(EMOJI_OPTIONS[0].id);
  });

  it('disables emoji selection when 3 emojis are selected', () => {
    const selectedEmojis = [EMOJI_OPTIONS[0], EMOJI_OPTIONS[1], EMOJI_OPTIONS[2]];
    
    render(
      <EmojiGrid 
        {...defaultProps} 
        selectedEmojis={selectedEmojis} 
      />
    );
    
    const unselectedEmoji = screen.getByText(EMOJI_OPTIONS[3].emoji).closest('button');
    expect(unselectedEmoji).toBeDisabled();
  });

  it('shows progress indicator', () => {
    const selectedEmojis = [EMOJI_OPTIONS[0], EMOJI_OPTIONS[1]];
    
    render(
      <EmojiGrid 
        {...defaultProps} 
        selectedEmojis={selectedEmojis} 
      />
    );
    
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });
});

