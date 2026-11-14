package app.whatchat.android.memories;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import app.whatchat.android.databinding.ItemMemoryCardBinding;
import app.whatchat.android.network.model.MySpaceEvent;
import app.whatchat.android.utils.DateUtils;
import com.bumptech.glide.Glide;
import java.util.List;

public class MemoryTimelineAdapter extends RecyclerView.Adapter<MemoryTimelineAdapter.MemoryViewHolder> {

    public interface OnCapsuleClickListener {
        void onCapsuleClick(MySpaceEvent event);
    }

    private final List<MySpaceEvent> eventList;
    private final OnCapsuleClickListener listener;

    public MemoryTimelineAdapter(List<MySpaceEvent> eventList, OnCapsuleClickListener listener) {
        this.eventList = eventList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public MemoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemMemoryCardBinding binding = ItemMemoryCardBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new MemoryViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull MemoryViewHolder holder, int position) {
        holder.bind(eventList.get(position));
    }

    @Override
    public int getItemCount() {
        return eventList.size();
    }

    class MemoryViewHolder extends RecyclerView.ViewHolder {
        private final ItemMemoryCardBinding binding;

        public MemoryViewHolder(ItemMemoryCardBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        public void bind(MySpaceEvent item) {
            binding.tvTitle.setText(item.getTitle());
            binding.tvDescription.setText(item.getDescription());
            binding.tvCategory.setText(item.getCategory());
            binding.tvDate.setText(DateUtils.formatDate(item.getEventDate()));
            binding.tvMemoryCount.setText(item.getMessageCount() + " memories");

            if (item.getCoverImageUrl() != null && !item.getCoverImageUrl().isEmpty()) {
                binding.ivCover.setVisibility(View.VISIBLE);
                Glide.with(itemView.getContext()).load(item.getCoverImageUrl()).into(binding.ivCover);
            } else {
                binding.ivCover.setVisibility(View.GONE);
            }

            itemView.setOnClickListener(v -> {
                if (listener != null) listener.onCapsuleClick(item);
            });
        }
    }
}

